require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { handleConfigInteraction } = require('./handlers/configHandler');
const { BotManager } = require('./services/botManager');
const { GuildConfigStore } = require('./services/guildConfigStore');
const { commands } = require('./commands');

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('DISCORD_TOKEN is missing. Copy .env.example to .env and add your bot token.');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const botManager = new BotManager();
const guildConfigStore = new GuildConfigStore();

client.once('ready', async (readyClient) => {
  await guildConfigStore.load();
  const rest = new REST({ version: '10' }).setToken(token);
  await rest.put(Routes.applicationCommands(readyClient.user.id), { body: commands });
  await Promise.all(guildConfigStore.getCustomConfigs().map(({ botToken }) => (
    botManager.syncCustomBot(botToken, commands)
  )));
  console.log(`Logged in as ${readyClient.user.tag}`);
  console.log('Slash commands registered.');
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand() && interaction.commandName === 'config') {
      if (!interaction.memberPermissions?.has('ManageGuild')) {
        return interaction.reply({ content: 'You need Manage Server permission to use this command.', ephemeral: true });
      }
      return handleConfigInteraction(interaction, botManager, guildConfigStore, commands);
    }
    if (await handleConfigInteraction(interaction, botManager, guildConfigStore, commands)) return;
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guildId || !guildConfigStore.isConfigured(interaction.guildId)) {
      return interaction.reply({ content: 'This server must be configured with /config before commands can be used.', ephemeral: true });
    }
    if (interaction.commandName === 'ping') await interaction.reply(`Pong! ${client.ws.ping}ms`);
    if (interaction.commandName === 'hello') await interaction.reply(`Hello, ${interaction.user}!`);
  } catch {
    const response = { content: 'Something went wrong while handling that interaction.', ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.editReply(response);
    else await interaction.reply(response);
  }
});

client.login(token);
