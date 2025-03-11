import { config } from 'dotenv';

config();

const botToken = process.env.BOT_TOKEN;

if (!botToken) throw new Error('BOT_TOKEN is undefined');

const clientId = process.env.CLIENT_ID;

if (!clientId) throw new Error('CLIENT_ID is undefined');

const dbHost = process.env.DB_HOST;

if (!dbHost) throw new Error('DB_HOST is undefined');

const dbPort = Number(process.env.DB_PORT);

if (!dbPort) throw new Error('DB_PORT is undefined');

const dbUser = process.env.DB_USERNAME;

if (!dbUser) throw new Error('DB_USERNAME is undefined');

const dbPass = process.env.DB_PASSWORD;

if (!dbPass) throw new Error('DB_PASSWORD is undefined');

const dbDatabase = process.env.DB_DATABASE;

if (!dbDatabase) throw new Error('DB_DATABASE is undefined');

export default {
  botToken,
  clientId,
  database: {
    host: dbHost,
    port: dbPort,
    username: dbUser,
    password: dbPass,
    database: dbDatabase,
  }
};
