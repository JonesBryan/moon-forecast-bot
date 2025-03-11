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
import { models } from '../../database';
import { point } from '../../database/models/User';
import { createForecast, formatForecast, setUserTimezone } from '../../lib';

const command = new SlashCommandBuilder()
  .setName('setlocation')
  .setDescription('Set your desired location')
  .setIntegrationTypes(1)
  .setContexts(0, 1, 2)
  .addNumberOption((option) =>
    option
      .setName('latitude')
      .setDescription('Latitude of your location')
      .setRequired(true),
  )
  .addNumberOption((option) =>
    option
      .setName('longitude')
      .setDescription('Longitude of your location')
      .setRequired(true),
  );

const execute = async (
  interaction: ChatInputCommandInteraction,
  bot: MoonForecastBot,
) => {
  const latitude = interaction.options.getNumber('latitude');
  const longitude = interaction.options.getNumber('longitude');

  if (!latitude || !longitude) {
    console.log('Invalid params', latitude, longitude);
    await interaction.reply(
      `Could not parse latitude and longitude [${latitude}, ${longitude}]`,
    );
    return;
  }

  if (latitude > 90 || latitude < -90) {
    console.log('Invalid params', latitude, longitude);
    await interaction.reply(
      `Latitude must be [-90, 90]. Provided: \`${latitude}\``,
    );
    return;
  }

  if (longitude > 180 || longitude < -180) {
    console.log('Invalid params', latitude, longitude);
    await interaction.reply(
      `Longitude must be [-180, 180]. Provided: \`${longitude}\``,
    );
    return;
  }

  // Reduce precision to one decimal.
  const locationArray = [latitude, longitude].map((x) => Number(x.toFixed(1)));

  const coordinates: point = {
    type: 'Point',
    coordinates: locationArray,
  };

  const [user, isNew] = await models.User.findOrCreate({
    where: {
      discord_id: interaction.user.id,
    },
    defaults: {
      discord_id: interaction.user.id,
      coordinates,
    },
  });

  // Update existing user's location.
  if (!isNew) {
    const [oldLat, oldLong] = user.coordinates.coordinates;
    const [newLat, newLong] = coordinates.coordinates;

    // Only update if something's changed.
    if (oldLat !== newLat || oldLong !== newLong) {
      console.log('Updating user:', interaction.user.id);
      await user.update({ coordinates });
    }
  }

  // Generate a forecast to get user's timezone
  // and show an instant forecast.
  const forecast = await createForecast(coordinates);

  await setUserTimezone(user, forecast.timezone);

  const formattedForecast = formatForecast(forecast);

  await interaction.reply(formattedForecast);
};

export { command, execute };
