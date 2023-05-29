import createBinance, {
    Binance,
    Account,
    OrderSide,
    OrderType,
    Order,
} from "binance-api-node";

export class BinanceHandler {
    private binanceClient: Binance;

    constructor() {
        this.binanceClient = this.createBinanceClient();
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

    public async createOrder(pairSymbol: string, buyAmount: number): Promise<Order> {
        const order: Order = await this.binanceClient.order({
            symbol: pairSymbol,
            side: OrderSide.BUY,
            quantity: buyAmount.toString(),
            type: OrderType.MARKET,
            recvWindow: 60000,
        });

        return order;
    }

    public async sellOrder(pairSymbol: string, sellAmount: number): Promise<Order> {
        const order: Order = await this.binanceClient.order({
            symbol: pairSymbol,
            side: OrderSide.SELL,
            quantity: sellAmount.toString(),
            type: OrderType.MARKET,
            recvWindow: 60000,
        });

        return order;
    }

    public async getCurrentPairPrice(pairSymbol: string): Promise<string> {
        const priceList: { [index: string]: string } = await this.binanceClient.prices({ symbol: pairSymbol });
        return priceList[pairSymbol];
    }

    public async getAccountInfo(): Promise<Account> {
        const accountInfo: Account = await this.binanceClient.accountInfo();
        return accountInfo;
    }
}