<div align="center">
  <img src="img/dogebot.png" alt="doge-bot" width="250" height="250">
  <p>Crypto trading bot that follows a Twitter account and buys crypto automatically when mentioned!</p>
</div>  

## Configuration

Before running the DogeBot application, make sure to provide required configuration.  

### 1. Environmental variables
Set up the required API keys by creating a .env file in the config directory. The .env file should have the following structure:

```
TWITTER_CONSUMER=""
TWITTER_CONSUMER_KEY=""
TWITTER_ACCESS_TOKEN=""
TWITTER_ACCESS_SECRET=""
BINANCE_API_KEY=""
BINANCE_API_SECRET=""
```
  
Replace the empty quotes ("") with your actual API keys obtained from the respective services.  
These API keys are necessary for accessing the [Twitter API](https://developer.twitter.com/en/docs/twitter-api). and [Binance API](https://www.binance.com/en/binance-api).  

### 2. Dogebot conifg

Create a file named dogebot.config.js in config directory. The file should have the following structure:

```json
{
    "twitterId": 44196397,
    "allowReplies": false,
    "trade": {
        "enabled": false,
        "balancePercentage": 0.25,
        "timeToSell": 5,
        "coin": "DOGE",
        "pairCoin": "USDT"
    }
}
``` 

Customize the values in the JSON object according to your preferences:  

- "twitterId": Replace 44196397 with the Twitter user ID you want to track. You can find the user ID using online tools or Twitter API documentation.
- "allowReplies": Set this to true if you want the bot to respond to replies, or false if you want to ignore replies.
- "trade": Configure the trade settings as per your requirements. Adjust the values of "enabled", "balancePercentage", "timeToSell", "coin", and "pairCoin" based on your trading strategy.  

Make sure to review and update the configuration values according to your needs before running the DogeBot application.  

## Run with Docker

Build the Docker image by running the following command: 

```bash
docker build -t node-dogebot:1.0.0 .
```

Once the image is built, you can run a Docker container with the following command: 

```bash
docker run -d --name dogebot-container node-dogebot:1.0.0
```

The DogeBot application should now be running inside the Docker container. You can check the logs of the container using the following command: 

```bash
docker logs dogebot-container
```

## License

This project is licensed under the MIT License.
