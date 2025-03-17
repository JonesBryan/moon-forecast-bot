import axios from 'axios';
import { point, User } from '../database/models/User';
import { EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { Timezone } from '../database/models/Timezone';
import config from '../config';
import SunCalc from 'suncalc';

interface DayData {
  datetime: string;
  cloudcover: number;
  moonphase: number;
  moonrise?: string;
  moonset?: string;
  sunrise: string;
  sunset: string;

  hours: {
    datetime: string;
    cloudcover: number;
  }[];
}

interface ResponseData {
  latitude: number;
  longitude: number;
  timezone: string;
  tzOffset: number;

  days: DayData[];
}

const base_url =
  'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

const include = 'days,hours';
const elements =
  'moonrise,moonset,moonphase,cloudcover,datetime,sunrise,sunset';

// Get the forecase data from the API.
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
  // 7-day forecast, grab extra day for calculations.
  const data = forecast.days.slice(0, 8);

  const days = data
    .map((day, index, arr) => {
      if (index === 7) return '';

      const dateStr = new Date(day.datetime).toLocaleDateString('en-US', {
        timeZone: 'UTC',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const moonPhasePct = Math.round(day.moonphase * 100);
      const cloudcoverList: number[] = [];

      // Calculate cloud cover based on hours of night only.
      for (const hour of day.hours) {
        if (hour.datetime < day.sunrise || hour.datetime > day.sunset)
          cloudcoverList.push(hour.cloudcover);
      }

      const cloudCover =
        cloudcoverList.reduce((acc, val) => acc + val) / cloudcoverList.length;

      const date = new Date(day.datetime);

      date.setDate(date.getDate() + 1);

      const { night, nightEnd } = SunCalc.getTimes(
        date,
        forecast.latitude,
        forecast.longitude,
      );

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };

      // For calculating the night period, use the next day’s sunrise.
      let moonless = calculateMoonlessPeriod(
        day,
        arr[index + 1],
        night,
        nightEnd,
      );

      return `📅 **${dateStr}**
- 🌇 Astro Dusk: ${night.toLocaleTimeString('en-US', timeOptions)}
- 🌅 Astro Dawn: ${nightEnd.toLocaleTimeString('en-US', timeOptions)}
- 🌙 Moon Phase: ${getMoonPhase(day.moonphase)} (${moonPhasePct}%)
- 🌅 Moonrise: ${day.moonrise || 'N/A'}
- 🌄 Moonset: ${day.moonset || 'N/A'}
- ☁️ Avg. Cloud Cover (night): ${cloudCover.toFixed(0)}%
- 🌌 Moonless Night: ${moonless}`;
    })
    .slice(0, 7)
    .join('\n\n');

  const text = `🌙 **Moon Forecast for the Week** 🌙\n\n${days}`;

  return {
    content: text,
  };
};

function calculateMoonlessPeriod(
  currentDay: DayData,
  nextDay: DayData,
  nightStart: Date,
  nightEnd: Date,
): string {
  nightEnd.setDate(nightEnd.getDate() + 1);

  let moonriseDate: Date;
  if (currentDay.moonrise) {
    // Parse current day's moonrise.
    moonriseDate = new Date(`${currentDay.datetime}T${currentDay.moonrise}`);
    // If this moonrise occurs before sunset, assume it actually happens after midnight.
    if (moonriseDate < nightStart) {
      moonriseDate = new Date(`${nextDay.datetime}T${currentDay.moonrise}`);
    }
  } else if (nextDay.moonrise) {
    // If current day has no moonrise, use the next day's moonrise.
    moonriseDate = new Date(`${nextDay.datetime}T${nextDay.moonrise}`);
    // In rare cases, if the next day's moonrise is before nightStart, fall back.
    if (moonriseDate < nightStart) {
      moonriseDate = nightStart;
    }
  } else {
    // Fallback if no moonrise info is available.
    moonriseDate = nightStart;
  }

  let moonsetDate: Date;
  if (currentDay.moonset) {
    // Parse current day's moonset.
    moonsetDate = new Date(`${currentDay.datetime}T${currentDay.moonset}`);
    // If moonset occurs before sunset, assume it occurs after midnight.
    if (moonsetDate < nightStart) {
      moonsetDate = new Date(`${nextDay.datetime}T${currentDay.moonset}`);
    }
  } else {
    // If missing, assume the moon remains up until nightEnd.
    moonsetDate = nightEnd;
  }

  console.log(moonriseDate, moonsetDate, nightStart, nightEnd);

  let moonlessMinutes = 0;
  // Gap before moonrise (if moonrise is after nightStart).
  if (moonriseDate > nightStart) {
    moonlessMinutes += (moonriseDate.getTime() - nightStart.getTime()) / 60000;
  }
  // Gap after moonset (if moonset is before nightEnd).
  if (moonsetDate < nightEnd) {
    moonlessMinutes += (nightEnd.getTime() - moonsetDate.getTime()) / 60000;
  }

  if (moonlessMinutes <= 0) {
    return 'None';
  }

  let hours = Math.floor(moonlessMinutes / 60);
  let minutes = Math.round(moonlessMinutes % 60);

  if (minutes === 60) {
    hours++;
    minutes = 0;
  }

  return `${hours}h ${minutes}m`;
}

function getMoonPhase(phase: number): string {
  if (phase === 0 || phase === 1) return 'New Moon';
  if (phase < 0.25) return '🌒 Waxing Crescent';
  if (phase === 0.25) return '🌓 First Quarter';
  if (phase < 0.5) return '🌔 Waxing Gibbous';
  if (phase === 0.5) return '🌕 Full Moon';
  if (phase < 0.75) return '🌖 Waning Gibbous';
  if (phase === 0.75) return '🌗 Last Quarter';
  return '🌘 Waning Crescent';
}

export const setUserTimezone = async (user: User, timezoneStr: string) => {
  const [timezone] = await Timezone.findOrCreate({
    where: { name: timezoneStr },
  });

  await user.update({ timezone_id: timezone.id });
};
