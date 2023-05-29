import {
    Account,
    AssetBalance,
    OrderSide,
    OrderFill,
    Order,
} from "binance-api-node";
import dotenv from "dotenv";
import { join } from "path";
import Twit, { Stream } from "twit";

import { TwitterHandler } from "./twitterhandler";
import { BinanceHandler } from "./binancehandler";

dotenv.config({
    path: join(__dirname, '../config/.env')
});

const MINIMUM_TRADE_VALUE = 10;

export interface ITradeConfig {
    enabled?: boolean;
    balancePercentage?: number;
    timeToSell?: number;
    coin?: string;
    pairCoin?: string;
}

export interface IDogeBotConfig {
    twitterId: string;
    allowReplies?: boolean;
    trade: ITradeConfig;
}

export class DogeBot {
    private twitterId: string;
    private allowReplies: boolean;
    private trade: ITradeConfig;
    private twitterHandler: TwitterHandler;
    private binanceHandler: BinanceHandler;

    constructor(config: IDogeBotConfig) {
        this.twitterId = config.twitterId;
        this.allowReplies = config.allowReplies ?? false;
        this.trade = { enabled: false, balancePercentage: 1, timeToSell: 5, ...config.trade };
        this.twitterHandler = new TwitterHandler();
        this.binanceHandler = new BinanceHandler();
    }

    public trackTwitter() {
        console.log("Tracking Twitter...");
        const stream: Stream = this.twitterHandler.createStream({ follow: this.twitterId });
        stream.on("tweet", this.handleTwitterStream);
    }

    private handleTwitterStream(tweet: Twit.Twitter.Status) {
        if (tweet.user.id_str === this.twitterId) {
            const isReply: boolean = !!tweet.in_reply_to_status_id;
            const isTradeEnabled: boolean = !!(this.trade.enabled && tweet.text && this.trade.coin);

            if (isTradeEnabled && (!isReply || (isReply && this.allowReplies))) {
                console.log("New tweet\n\n", tweet.text);

                const tweetText: string = tweet.text!.toLowerCase();
                const tradeCoin: string = this.trade.coin!.toLowerCase();

                if (tweetText.includes(tradeCoin)) {
                    this.createOrder();
                }
            }
        }
    }

    private async createOrder(): Promise<void> {
        const pairSymbol: string = `${this.trade.coin}${this.trade.pairCoin}`;
        const price: string = await this.binanceHandler.getCurrentPairPrice(pairSymbol);

        const accountInfo: Account = await this.binanceHandler.getAccountInfo();
        const pairCoinBalance: AssetBalance | undefined = accountInfo.balances.find(
            (asset) => asset.asset === this.trade.pairCoin
        );

        if (!pairCoinBalance || parseFloat(pairCoinBalance.free) < MINIMUM_TRADE_VALUE) {
            console.error(`Insufficient ${this.trade.pairCoin} balance.`);
            return;
        }

        const tradeAmount: number = parseFloat(pairCoinBalance.free) * this.trade.balancePercentage!;
        const buyAmount: number = tradeAmount / parseFloat(price);

        const order: Order = await this.binanceHandler.createOrder(pairSymbol, buyAmount, OrderSide.BUY);

        if (order && order.fills) {
            let totalPrice: number = 0;
            let quantity: number = 0;
            let commission: number = 0;

            order.fills.forEach((fill: OrderFill) => {
                totalPrice += parseFloat(fill.price);
                quantity += parseFloat(fill.qty);
                commission += parseFloat(fill.commission);
            });

            const avgPrice: number = totalPrice / order.fills.length;

            console.log(`Bought: ${order.origQty} ${order.symbol}. \n\n
            Avg. price: ${avgPrice} (${quantity} ${order.symbol}). \n\n
            Commission fee: ${commission} (${order.fills[0].commissionAsset}).`);

            setTimeout(async () => await this.makeProfit(avgPrice), 60000 * this.trade.timeToSell!);
        }
    }

    private async makeProfit(buyPrice: number) {
        const pairSymbol: string = `${this.trade.coin}${this.trade.pairCoin}`;
        const accountInfo: Account = await this.binanceHandler.getAccountInfo();
        const pairCoinBalance: AssetBalance | undefined = accountInfo.balances.find(
            (asset) => asset.asset === this.trade.coin
        );

        if (!pairCoinBalance) {
            console.error(`Insufficient ${this.trade.coin} balance.`);
            return;
        }

        const sellAmount: number = parseInt(pairCoinBalance.free);

        const order: Order = await this.binanceHandler.createOrder(pairSymbol, sellAmount, OrderSide.SELL);

        if (order && order.fills) {
            let totalPrice: number = 0;
            let quantity: number = 0;
            let commission: number = 0;

            order.fills.forEach((fill: OrderFill) => {
                totalPrice += parseFloat(fill.price);
                quantity += parseFloat(fill.qty);
                commission += parseFloat(fill.commission);
            });

            const avgPrice: number = totalPrice / order.fills.length;
            const profit: string = (((totalPrice - buyPrice) / buyPrice) * 100).toFixed(2);

            console.log(`Sold: ${order.origQty} ${order.symbol}. \n\n
            Avg. price ${avgPrice} (${quantity} ${order.symbol}). \n\n
            Profit: ${profit}%. \n\n
            Commission fee:${commission} (${order.fills[0].commissionAsset}).`);
        }
    }
}
