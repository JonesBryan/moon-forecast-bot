import { Sequelize } from 'sequelize';
import config from '../config';
import { User, UserFactory } from './models/User';

export const models = {
  User,
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

  await database.validate();

  return database;
};
