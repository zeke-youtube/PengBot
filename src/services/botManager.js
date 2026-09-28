const { Client, GatewayIntentBits } = require('discord.js');
class BotManager {
  async validateCustomBot(token, commands) {
    if (typeof token !== 'string' || token.trim().length === 0) return false;

    const customClient = new Client({ intents: [GatewayIntentBits.Guilds] });
    try {
      await Promise.race([
        customClient.login(token.trim()),
        new Promise((_, reject) => setTimeout(() => reject(new Error('login timeout')), 15000)),
      ]);
      await this.syncCommands(token.trim(), customClient.user.id, commands);
      return { valid: true, applicationId: customClient.user.id };
    } catch {
      // Do not expose or log the token, or the underlying authentication error.
      return { valid: false };
    } finally {
      customClient.destroy();
    }
  }

  async syncCommands(token, applicationId, commands) {
    const rest = new (require('discord.js').REST)({ version: '10' }).setToken(token);
    await rest.put(require('discord.js').Routes.applicationCommands(applicationId), { body: commands });
  }

  async syncCustomBot(token, commands) {
    const customClient = new Client({ intents: [GatewayIntentBits.Guilds] });
    try {
      await Promise.race([
        customClient.login(token),
        new Promise((_, reject) => setTimeout(() => reject(new Error('login timeout')), 15000)),
      ]);
      await this.syncCommands(token, customClient.user.id, commands);
    } catch {
      // Startup should continue even if a previously configured custom bot is unavailable.
    } finally {
      customClient.destroy();
    }
  }

}

module.exports = { BotManager };
