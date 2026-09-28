const { SlashCommandBuilder } = require('discord.js');
const configCommand = require('./config');

const definitions = [
  new SlashCommandBuilder().setName('ping').setDescription('Check whether the bot is online'),
  new SlashCommandBuilder().setName('hello').setDescription('Say hello to the bot'),
  configCommand.data,
];

module.exports = { definitions, commands: definitions.map((command) => command.toJSON()) };
