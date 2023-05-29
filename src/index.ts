import fs from "fs";
import { DogeBot } from "./dogebot";
import { join } from "path";

const CONFIG_PATH: string = join(__dirname, "../config/dogebot.config.json");

fs.readFile(CONFIG_PATH, "utf8", (err, data) => {
  if (err) {
    console.error("Error loading dogebot.config.json", err);
    process.exit(1);
  }

  const config = JSON.parse(data);
  const dogeBot = new DogeBot(config);
  dogeBot.trackTwitter();
});
