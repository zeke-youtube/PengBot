const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const BOT_SETUP_BUTTON = 'config:bot-setup';
const OFFICIAL_BOT_BUTTON = 'config:official-bot';
const CUSTOM_BOT_BUTTON = 'config:custom-bot';
const CUSTOM_BOT_MODAL = 'config:custom-bot-modal';
const CUSTOM_TOKEN_INPUT = 'config:custom-token';

function panel() {
  return {
    embeds: [new EmbedBuilder()
      .setTitle('PengBot Configuration')
      .setDescription('Choose a configuration section below.')
      .setColor(0x5865f2)],
    components: [new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(BOT_SETUP_BUTTON)
        .setLabel('Bot Setup')
        .setStyle(ButtonStyle.Primary),
    )],
  };
}

function botSetupPanel() {
  return {
    embeds: [new EmbedBuilder()
      .setTitle('Bot Setup')
      .setDescription('Choose which bot PengBot should use.')
      .setColor(0x5865f2)],
    components: [new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(OFFICIAL_BOT_BUTTON)
        .setLabel('Official PengBot')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(CUSTOM_BOT_BUTTON)
        .setLabel('Custom Bot')
        .setStyle(ButtonStyle.Secondary),
    )],
  };
}

function customBotModal() {
  const tokenInput = new TextInputBuilder()
    .setCustomId(CUSTOM_TOKEN_INPUT)
    .setLabel('Discord bot token')
    .setPlaceholder('Paste the token here')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(200);

  return new ModalBuilder()
    .setCustomId(CUSTOM_BOT_MODAL)
    .setTitle('Configure Custom Bot')
    .addComponents(new ActionRowBuilder().addComponents(tokenInput));
}

async function handleConfigInteraction(interaction, botManager, guildConfigStore, commands) {
  if (interaction.isChatInputCommand() && interaction.commandName === 'config') {
    return interaction.reply({ ...panel(), ephemeral: true });
  }

  if (!interaction.isButton() && !interaction.isModalSubmit()) return false;
  if (interaction.isButton() && interaction.customId === BOT_SETUP_BUTTON) {
    return interaction.update(botSetupPanel());
  }
  if (interaction.isButton() && interaction.customId === OFFICIAL_BOT_BUTTON) {
    await guildConfigStore.setOfficial(interaction.guildId);
    return interaction.update({
      content: 'Official PengBot selected.',
      embeds: [],
      components: [],
    });
  }
  if (interaction.isButton() && interaction.customId === CUSTOM_BOT_BUTTON) {
    return interaction.showModal(customBotModal());
  }
  if (interaction.isModalSubmit() && interaction.customId === CUSTOM_BOT_MODAL) {
    const customToken = interaction.fields.getTextInputValue(CUSTOM_TOKEN_INPUT);
    await interaction.deferReply({ ephemeral: true });
    const result = await botManager.validateCustomBot(customToken, commands);
    if (result.valid) await guildConfigStore.setCustom(interaction.guildId, customToken.trim());
    return interaction.editReply({
      content: result.valid
        ? 'Custom bot validated and logged in successfully.'
        : 'Unable to validate that bot token. Check the token and try again.',
    });
  }
  return false;
}

module.exports = { handleConfigInteraction };
