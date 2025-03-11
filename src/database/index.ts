import { Sequelize } from 'sequelize';
import config from '../config';
import { User, UserFactory } from './models/User';
import { Timezone, TimezoneFactory } from './models/Timezone';

export const models = {
  User,
  Timezone,
};

// Initialize the database
export const setup = async (): Promise<Sequelize> => {
  const database = new Sequelize({
    ...config.database,
    dialect: 'mariadb',
    dialectOptions: {
      supportBigNumbers: true,
      bigNumberStrings: true,
    },
    define: {
      timestamps: false,
    },
  });

  UserFactory(database);
  TimezoneFactory(database);

  User.belongsTo(Timezone, { foreignKey: 'timezone_id' });
  Timezone.hasMany(User, { foreignKey: 'timezone_id' });

  await database.validate();

  return database;
};
