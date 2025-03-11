import MoonForecastBot from './bot';
import { setup } from './database';

(async () => {
  const sequelize = await setup();

  console.log('Sequelize connected');

  const bot = new MoonForecastBot(sequelize);
})();
