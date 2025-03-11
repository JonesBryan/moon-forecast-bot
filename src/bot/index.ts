import {
  ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
  IntentsBitField,
  Interaction,
  REST,
  Routes,
} from 'discord.js';
import config from '../config';
import * as commands from './commands';

type Command = (interaction: ChatInputCommandInteraction, bot: MoonForecastBot) => Promise<void>;

// A Discord bot that will send a weekly update on
// the status of the moon for the user's location.
export default class MoonForecastBot extends Client {
  // Interval to send updates weekly for each user.
  private _forecastInterval: NodeJS.Timeout;

  private _token: string;

  private _commands: Record<string, Command> = {};

  constructor() {
    super({
      intents: [],
    });

    this._token = config.botToken;

    this._init();
  }

  // Initialize the forecast timer. Check every 10 seconds.
  private _createForecastInterval(): NodeJS.Timeout {
    const interval = setInterval(() => {}, 10_000);

    return interval;
  }

  // Handler for slash commands.
  private async _handleInteraction(interaction: Interaction) {
    // Ignore non-slash-command interactions.
    if (!interaction.isChatInputCommand()) return;

    const incomingCommand = interaction as ChatInputCommandInteraction;

    console.log('Interaction received:', incomingCommand);

    const command = this._commands[incomingCommand.commandName];

    console.log('Command name:', incomingCommand.commandName);
    console.log('Found:', command !== undefined);

    await command(incomingCommand, this);
  }

  // Start the bot.
  async _init(): Promise<void> {
    this.once('ready', () => {
      console.log('Client logged in');
      this._forecastInterval = this._createForecastInterval();

      this._updateCommands();
    });

    // Handler for slash commands.
    this.on('interactionCreate', (interaction) => {
      this._handleInteraction(interaction);
    });

    console.log('Client logging in');
    await this.login(this._token);
  }

  // Send the command list to Discord so it can update
  // the list for every user.
  private async _updateCommands() {
    const rest = new REST().setToken(this._token);

    const cmds = Object.entries(commands).map(([key, { command }]) => command.toJSON());

    // Register commands with discord.
    await rest
      .put(Routes.applicationCommands(config.clientId), {
        body: cmds,
      })
      .catch((err) => {
        console.dir(err, { depth: Infinity });
      });

    // Convert commands to a map and store it.
    for (const [key, value] of Object.entries(commands)) {
      this._commands[key] = value.execute;

      console.log('Added command:', key);
    }
  }
}
