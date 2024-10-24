import express from "express";
import bodyParser from "body-parser";
import chalk from "chalk";
import os from "os";
import dotenv from "dotenv";
import fs from "fs";
import TelegramBot from "node-telegram-bot-api";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_NAME = process.env.BOT_NAME || "Trade Alert Bot";
const SUBSCRIBERS_FILE = "subscribers.json";
const SUPPORTED_FILE = "supported.json";
let subscribers = [];

const loadSubscribers = () => {
	if (fs.existsSync(SUBSCRIBERS_FILE)) {
		const data = fs.readFileSync(SUBSCRIBERS_FILE);
		try {
			subscribers = JSON.parse(data);
			if (!Array.isArray(subscribers)) {
				subscribers = [];
			}
		} catch (err) {
			subscribers = [];
		}
	} else {
		subscribers = [];
	}
};

const saveSubscribers = () => {
	fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
};

loadSubscribers();

const colors = {
	timestamp: chalk.blue,
	action: chalk.green,
	position: chalk.yellow,
	price: chalk.magenta,
	symbol: chalk.cyan,
	success: chalk.greenBright,
	error: chalk.red,
	info: chalk.white,
};

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.on("polling_error", (error) => {
	console.error(`Polling error: ${error.message}`);
});

bot.onText(/\/alertme/, (msg) => {
	const chatId = msg.chat.id;
	if (!subscribers.includes(chatId)) {
		subscribers.push(chatId);
		saveSubscribers();
		bot.sendMessage(chatId, "✅ You are now subscribed to alerts. Stay tuned for updates!");
	} else {
		subscribers = subscribers.filter((id) => id !== chatId);
		saveSubscribers();
		bot.sendMessage(chatId, "❌ You have unsubscribed from alerts. We hope to see you back soon!");
	}
});

bot.onText(/\/start/, (msg) => {
	const welcomeMessage = `👋 Welcome to ${BOT_NAME}! 

Use the following commands:
- **/alertme**: Subscribe/unsubscribe to alerts.
- **/supported**: Get the list of supported symbols and timeframes.
  
We're excited to have you here!`;
	bot.sendMessage(msg.chat.id, welcomeMessage, { parse_mode: "Markdown" });
});

bot.onText(/\/supported/, (msg) => {
	const chatId = msg.chat.id;

	if (fs.existsSync(SUPPORTED_FILE)) {
		const data = fs.readFileSync(SUPPORTED_FILE);
		try {
			const supportedSymbols = JSON.parse(data);
			if (Array.isArray(supportedSymbols) && supportedSymbols.length > 0) {
				let responseMessage = `📊 *Supported Symbols and Timeframes*\n\n`;
				supportedSymbols.forEach((item) => {
					responseMessage += `🔹 *Symbol*: ${item.symbol}\n`;
					responseMessage += `   ⏲ *Timeframes*: ${item.timeframes.join(", ")}\n\n`;
				});

				bot.sendMessage(chatId, responseMessage, { parse_mode: "Markdown" });
			} else {
				bot.sendMessage(chatId, "ℹ️ No supported symbols found.", { parse_mode: "Markdown" });
			}
		} catch (err) {
			console.error(colors.error("❌ Error reading supported.json:", err));
			bot.sendMessage(chatId, "❌ Error loading supported symbols. Please try again later.", { parse_mode: "Markdown" });
		}
	} else {
		bot.sendMessage(chatId, "❌ Supported symbols file not found.", { parse_mode: "Markdown" });
	}
});

const sendAlertToSubscribers = async (message) => {
	if (subscribers.length === 0) {
		console.log(colors.info("ℹ️ No subscribers to send alerts to."));
		return;
	}
	for (const subscriber of subscribers) {
		await bot.sendMessage(subscriber, message, { parse_mode: "Markdown" });
	}
};

app.post("/webhook", (req, res) => {
	try {
		const alertData = req.body;

		const position = alertData.position == "pico_top" ? "TOP" : "BOTTOM";

		const message =
			`🚨 *${BOT_NAME} ${position} ALERT* 🚨\n\n` +
			`💲 *Price*: ${alertData.price}\n` +
			`💼 *Symbol*: ${alertData.symbol}\n\n` +
			`🕒 *Timeframe*: ${alertData.timeframe}\n` +
			`🔔 Stay alert and keep trading smart!\n\n` +
			sendAlertToSubscribers(message);

		res.status(200).send("✅ Webhook received successfully!");
		console.log(colors.success("✅ Webhook received successfully!"));
	} catch (error) {
		console.error(colors.error("❌ Error handling webhook:", error));
		res.status(500).send("🛑 Error processing webhook");
	}
});

const getPublicIPv4 = () => {
	const interfaces = os.networkInterfaces();
	for (const name of Object.keys(interfaces)) {
		for (const iface of interfaces[name]) {
			if (iface.family === "IPv4" && !iface.internal) {
				return iface.address;
			}
		}
	}
	return null;
};

// Start the server
const port = 3000;
app.listen(port, () => {
	console.log(colors.info(`🚀 Webhook server is running on port ${port}...`));

	const ipv4 = getPublicIPv4();
	if (ipv4) {
		console.log(colors.info(`🌐 Server is accessible at: http://${ipv4}:${port}`));
	} else {
		console.log(colors.error("❌ No public IPv4 address found"));
	}
});
