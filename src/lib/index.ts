import axios from 'axios';
import { point, User } from '../database/models/User';
import { EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { Timezone } from '../database/models/Timezone';
import config from '../config';

interface ResponseData {
  latitude: number;
  longitude: number;
  timezone: string;
  tzOffset: number;

  days: {
    datetime: string;
    cloudcover: number;
    moonphase: number;
    moonrise: string;
    moonset: string;

    hours: {
      datetime: string;
      cloudcover: number;
    }[];
  }[];
}

const base_url =
  'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

const include = 'days,hours';
const elements = 'moonrise,moonset,moonphase,cloudcover,datetime';

export const createForecast = async (coordinates: point) => {
  const [lat, long] = coordinates.coordinates;

  const fullUrl = `${base_url}/${lat},${long}`;

  const { data }: { data: ResponseData } = await axios.get(fullUrl, {
    params: {
      key: config.apiKey,
      include,
      elements,
    },
  });

  return data;
};

export const formatForecast = (
  forecast: ResponseData,
): InteractionReplyOptions => {
  const message: InteractionReplyOptions = {};

  const embed = new EmbedBuilder();

  return {};
};

export const setUserTimezone = async (user: User, timezoneStr: string) => {
  const [timezone] = await Timezone.findOrCreate({
    where: { name: timezoneStr },
  });

  await user.update({ timezone_id: timezone.id });
};
