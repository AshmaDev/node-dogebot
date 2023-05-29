import dotenv from "dotenv";
import Twit from "twit";

dotenv.config();

if (!process.env.TWIITER_CONSUMER_KEY) {
  console.error("TWIITER_CONSUMER_KEY is not defined in the environment variables.");
  process.exit(1);
}

if (!process.env.TWITTER_CONSUMER_SECRET) {
  console.error("TWITTER_CONSUMER_SECRET is not defined in the environment variables.");
  process.exit(1);
}

const twitterClient = new Twit({
  consumer_key: process.env.TWIITER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET,
});

const TWITTER_ID: string = "44196397"; // Elon's twitter ID

const trackTwitter = () => {
  const stream = twitterClient.stream("statuses/filter", { follow: TWITTER_ID });

  stream.on("tweet", (tweet: Twit.Twitter.Status) => {
    if (tweet.user.id.toString() === TWITTER_ID) {
      console.log("New tweet\n\n", tweet.text);
    }
  });
};

trackTwitter();