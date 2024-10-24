# Trade Alert Bot

This project is a simple Express.js server integrated with a Telegram bot that sends trade alerts to subscribers. The bot allows users to subscribe/unsubscribe to alerts, retrieve supported symbols and timeframes, and receive notifications based on webhooks.

## Features

-   **Subscribe/Unsubscribe to Alerts**: Users can subscribe to receive trading alerts and unsubscribe at any time via the `/alertme` command.
-   **Supported Symbols**: Retrieve a list of supported symbols and timeframes using the `/supported` command.
-   **Webhook Integration**: The server listens for incoming webhooks and broadcasts trading alerts to all subscribers.

## Prerequisites

-   **Node.js**: Ensure you have Node.js installed (version 14.x or higher).
-   **Telegram Bot**: You need a Telegram bot token. You can get this by creating a new bot using [BotFather](https://core.telegram.org/bots#botfather) on Telegram.
-   **Environment Variables**: Set up the environment variables for the bot in a `.env` file.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-repo/trade-alert-bot.git
    cd trade-alert-bot
    ```

2. Install the required dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:

    ```plaintext
    TELEGRAM_BOT_TOKEN=your-telegram-bot-token
    BOT_NAME=Trade Alert Bot
    ```

4. Prepare the `subscribers.json` and `supported.json` files:
    - `subscribers.json`: Store the Telegram user IDs of subscribers.
    - `supported.json`: Store the supported trading symbols and timeframes in JSON format. Example:
        ```json
        [
        	{
        		"symbol": "BTCUSD",
        		"timeframes": ["1m", "5m", "1h"]
        	}
        ]
        ```

## Usage

1. **Start the Server**:
   Run the following command to start the Express.js server:

    ```bash
    npm start
    ```

2. The server will start running on port `3000`. You can access it locally or via the public IP (if available) at `http://<your-public-ip>:3000`.

3. **Telegram Bot Commands**:

    - `/start`: Welcome message and bot usage instructions.
    - `/alertme`: Subscribe/unsubscribe from alerts.
    - `/supported`: Get the list of supported symbols and timeframes.

4. **Webhook Endpoint**:
   The server listens for incoming POST requests at `/webhook`. The payload should include `position`, `price`, `symbol`, and `timeframe` fields, which will be sent as alerts to all subscribers.

## Example Webhook Payload

```json
{
	"position": "pico_top",
	"price": "45000",
	"symbol": "BTCUSD",
	"timeframe": "1h"
}
```

## Rate Limiting

To prevent spam, users are limited in how frequently they can send messages. The bot enforces a 1-minute cooldown per user for new messages.

## Future Plans

Here are some future enhancements planned for the bot:

-   **More Custom Commands**: Adding commands like `/setalertfrequency` to let users choose how often they receive alerts.
-   **Integration with Other Platforms**: Expanding to support other messaging services beyond Telegram.
-   **Symbol Prefrences**: Adding symbol prefrences.

## License

This project is licensed under the BSD 2-Clause License. See the [LICENSE](./LICENSE) file for details.

## Author

**Sanel Ryan**  
Telegram: [@itsbennfr](https://t.me/itsbennfr)
