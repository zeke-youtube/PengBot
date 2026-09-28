# PengBot

A small Node.js Discord bot with two slash commands:

- `/ping` — checks that the bot is online and reports latency.
- `/hello` — greets the user.

## Setup

1. Create an application and bot at <https://discord.com/developers/applications>.
2. Copy `.env.example` to `.env` and paste the bot token after `DISCORD_TOKEN=`. Never commit or share this file.
3. Install dependencies in PowerShell:

   ```powershell
   npm install
   ```

4. In the Developer Portal, open **OAuth2 > URL Generator**, select the `bot` and `applications.commands` scopes, then invite the bot to your server with the generated URL.
5. Start it:

   ```powershell
   npm start
   ```

Keep the terminal running while you use the bot. Global slash commands can take a little while to appear in Discord after the first startup.

## Docker

Create `.env` with the main bot token, then run:

```powershell
docker compose up -d --build
```

Custom bot configuration is persisted in `data/config.json`, mounted into the container and ignored by Git. Stop the container with `docker compose down`.
