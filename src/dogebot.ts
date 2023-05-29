import Twit from "twit";
import createBinance, {
    Binance,
    Account,
    AssetBalance,
    OrderSide_LT,
    OrderType,
    OrderFill,
    Order,
} from "binance-api-node";
import dotenv from "dotenv";
import { join } from "path";

dotenv.config({
    path: join(__dirname, '../config/.env')
});

const MINIMUM_TRADE_VALUE: number = 10;
const TRADE_SIDE: OrderSide_LT = "BUY";

export interface ITradeConfig {
    enabled?: boolean;
    balancePercentage?: number;
    coin?: string;
    pairCoin?: string
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

    private twitterClient: Twit;
    private binanceClient?: Binance;

    constructor(config: IDogeBotConfig) {
        this.twitterId = config.twitterId;
        this.allowReplies = config.allowReplies ?? false;
        this.trade = { enabled: false, balancePercentage: 1, ...config.trade };

        this.twitterClient = this.createTwitterClient();

        if (this.trade.enabled) {
            this.binanceClient = this.createBinanceClient();
        }
    }

    public trackTwitter() {
        console.log("Tracking Twitter...");
        const stream: Twit.Stream = this.twitterClient.stream("statuses/filter", { follow: this.twitterId });

        stream.on("tweet", (tweet: Twit.Twitter.Status) => {
            if (tweet.user.id.toString() === this.twitterId) {
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
        });
    };

    private async createOrder(): Promise<void> {
        if (!this.binanceClient) return;

        const pairSymbol: string = `${this.trade.coin}${this.trade.pairCoin}`;
        const priceList: { [index: string]: string } = await this.binanceClient!.prices({ symbol: pairSymbol });
        const price: string = priceList[pairSymbol];

        const accountInfo: Account = await this.binanceClient.accountInfo();
        const pairCoinBalance: AssetBalance | undefined = accountInfo.balances.find((asset) => asset.asset === this.trade.pairCoin);

        if (!pairCoinBalance || parseFloat(pairCoinBalance.free) < MINIMUM_TRADE_VALUE) {
            console.error(`Insufficient ${this.trade.pairCoin} balance.`);
            return;
        }

        const tradeAmount: number = parseFloat(pairCoinBalance.free) * this.trade.balancePercentage!;
        const buyAmount: number = tradeAmount / parseFloat(price);

        const order: Order = await this.binanceClient.order({
            symbol: pairSymbol,
            side: TRADE_SIDE,
            quantity: buyAmount.toString(),
            type: OrderType.MARKET,
            recvWindow: 60000,
        });

        if (order && order.fills) {
            let price: number = 0;
            let quantity: number = 0;
            let commission: number = 0;

            order.fills.forEach((fill: OrderFill) => {
                price += parseFloat(fill.price);
                quantity += parseFloat(fill.qty);
                commission += parseFloat(fill.commission);
            })

            const avgPrice: number = price / order.fills.length;

            console.log(`Bought: ${order.origQty} ${order.symbol}. \n\nAvg. price: ${avgPrice} (${quantity} ${order.symbol}). \n\nCommission fee: ${commission} (${order.fills[0].commissionAsset})`);

        }
    };

    private createTwitterClient(): Twit {
        if (!process.env.TWITTER_CONSUMER_KEY) {
            console.error("TWIITER_CONSUMER_KEY is not defined in the environment variables.");
            process.exit(1);
        }

        if (!process.env.TWITTER_API_SECRET) {
            console.error("TWITTER_API_SECRET is not defined in the environment variables.");
            process.exit(1);
        }

        return new Twit({
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_API_SECRET,
            access_token: process.env.TWITTER_ACCESS_TOKEN,
            access_token_secret: process.env.TWITTER_ACCESS_SECRET,
        });
    }

    private createBinanceClient(): Binance {
        if (!process.env.BINANCE_API_KEY) {
            console.error("BINANCE_API_KEY is not defined in the environment variables.");
            process.exit(1);
        }

        if (!process.env.BINANCE_API_SECRET) {
            console.error("BINANCE_API_SECRET is not defined in the environment variables.");
            process.exit(1);
        }

        return createBinance({
            apiKey: process.env.BINANCE_API_KEY,
            apiSecret: process.env.BINANCE_API_SECRET,
        });
    }
}
