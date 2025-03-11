import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  CommandInteraction,
  Interaction,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import MoonForecastBot from '..';

const command = new SlashCommandBuilder()
  .setName('test')
  .setDescription('Sends a test message')
  .setIntegrationTypes(1)
  .setContexts(0, 1, 2);

const execute = async (interaction: ChatInputCommandInteraction, bot: MoonForecastBot) => {
  await interaction.reply({ content: 'test', flags: [MessageFlags.Ephemeral] });
};

export { command, execute };
