import dotenv from "dotenv";
import Twit from "twit";

dotenv.config();

export class DogeBot {
    private twitterClient: Twit;
    private twitterId: string;

    constructor(config?: any) {
        this.twitterClient = this.createTwitterClient();
        this.twitterId = config.twitterId;
    }

    private createTwitterClient(): Twit {
        if (!process.env.TWIITER_CONSUMER_KEY) {
            console.error("TWIITER_CONSUMER_KEY is not defined in the environment variables.");
            process.exit(1);
        }

        if (!process.env.TWITTER_CONSUMER_SECRET) {
            console.error("TWITTER_CONSUMER_SECRET is not defined in the environment variables.");
            process.exit(1);
        }

        return new Twit({
            consumer_key: process.env.TWIITER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            access_token: process.env.TWITTER_ACCESS_TOKEN,
            access_token_secret: process.env.TWITTER_ACCESS_SECRET,
        });
    }

    public trackTwitter() {
        console.log("Tracking Twitter...");
        const stream: Twit.Stream = this.twitterClient.stream("statuses/filter", { follow: this.twitterId });

        stream.on("tweet", (tweet: Twit.Twitter.Status) => {
            if (tweet.user.id.toString() === this.twitterId) {
                console.log("New tweet\n\n", tweet.text);
            }
        });
    };
}
