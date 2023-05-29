import Twit, { Stream } from "twit";

export class TwitterHandler {
    private twitterClient: Twit;

    constructor() {
        this.twitterClient = this.createTwitterClient();
    }

    private createTwitterClient(): Twit {
        if (!process.env.TWIITER_CONSUMER_KEY) {
            console.error("TWIITER_CONSUMER_KEY is not defined in the environment variables.");
            process.exit(1);
        }

        if (!process.env.TWITTER_API_SECRET) {
            console.error("TWITTER_API_SECRET is not defined in the environment variables.");
            process.exit(1);
        }

        return new Twit({
            consumer_key: process.env.TWIITER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_API_SECRET,
            access_token: process.env.TWITTER_ACCESS_TOKEN,
            access_token_secret: process.env.TWITTER_ACCESS_SECRET,
        });
    }

    public createStream(params: Twit.Params): Stream {
        const stream: Stream = this.twitterClient.stream("statuses/filter", params);
        return stream;
    }
}