const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('config')
  .setDescription('Configure PengBot')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

module.exports = { data };
