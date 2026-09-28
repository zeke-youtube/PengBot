const fs = require('node:fs/promises');
const path = require('node:path');

const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));
const CONFIG_PATH = path.join(DATA_DIR, 'config.json');

class GuildConfigStore {
  constructor() {
    this.config = { guilds: {} };
  }

  async load() {
    try {
      this.config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));
      if (!this.config.guilds) this.config.guilds = {};
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  isConfigured(guildId) {
    return Boolean(this.config.guilds[guildId]?.configured);
  }

  getCustomConfigs() {
    return Object.values(this.config.guilds).filter((guild) => guild.mode === 'custom' && guild.botToken);
  }

  async setOfficial(guildId) {
    this.config.guilds[guildId] = { configured: true, mode: 'official' };
    await this.save();
  }

  async setCustom(guildId, botToken) {
    this.config.guilds[guildId] = { configured: true, mode: 'custom', botToken };
    await this.save();
  }

  async save() {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(CONFIG_PATH, `${JSON.stringify(this.config, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  }
}

module.exports = { GuildConfigStore };
