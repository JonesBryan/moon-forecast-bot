import { config } from 'dotenv';

config();

const botToken = process.env.BOT_TOKEN;

if (!botToken) throw new Error('BOT_TOKEN is undefined');

const clientId = process.env.CLIENT_ID;

if (!clientId) throw new Error('CLIENT_ID is undefined');

export default {
  botToken,
  clientId
};
