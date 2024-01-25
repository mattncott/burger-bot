import { Client, GatewayIntentBits } from "discord.js";
import { DiscordToken, ClientId } from "../Environment";
import { LogError, StartUpLog } from "../Logger";
import Balance from "./Commands/Balance";
import Burger from "./Commands/Burger";
import HighScore from "./Commands/Highscore";
import Gamble from "./Commands/Gamble";
import Shop from "./Commands/Shop";
import Status from "./Commands/Status";
import User from "./User";
import Cron from "../Cron";
import DiscordHandler from "./DiscordHandler";
import { SlashCommandBuilder, Routes } from 'discord.js';
import { REST }  from '@discordjs/rest';
import { LogInfo } from '../Logger';
import { IDiscordBot } from "./Interfaces/IDiscordBot";
import { BaseDiscordBot } from "./BaseDiscordBot";
import CheckSpoiler from "./Commands/CheckSpoiler";

export default class DiscordBot extends BaseDiscordBot implements IDiscordBot {

    constructor() {
        super();
    }

    public async Start(): Promise<void>
    {
        let client = null as unknown as Client;
        try {
            // Create a new client instance
            client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

            // When the client is ready, run this code (only once)
            client.once('ready', () => {
                StartUpLog('Discord Bot is online!');

                // start cron
                const cron = new Cron(client);
                cron.Run();
            });

            client.on('guildCreate', async (guild) => {
                const discordHandler = new DiscordHandler(client);
                discordHandler.SetupDiscordServer(guild);
                await this._database.AddGuild(guild.id);
                await this.RegisterCommands();
            });

            client.on('interactionCreate', async interaction => {
                if (!interaction.isChatInputCommand()) return;
    
                try {                
                    const { commandName } = interaction;

                    // When a user sends a command, add them to the system.
                    const userClass = new User(interaction);
                    await userClass.AddUser();
                
                    switch (commandName) {
                        case 'burger':
                            const burgerClass = new Burger(interaction, client);
                            await burgerClass.HandleCommand();
                            break;
                        case 'highscore':
                            const highscoreClass = new HighScore(interaction, client);
                            await highscoreClass.HandleCommand();
                            break;
                        case 'balance':
                            const balanceClass = new Balance(interaction);
                            await balanceClass.HandleCommand();
                            break;
                        case 'shop':
                            const shopClass = new Shop(interaction);
                            await shopClass.HandleCommand();
                            break;
                        case 'status':
                            const statusClass = new Status(interaction);
                            await statusClass.HandleCommand();
                            break;
                        case 'gamble':
                            const rouletteClass = new Gamble(interaction, client);
                            await rouletteClass.HandleCommand();
                            break;
                        case 'check':
                            const checkSpoiler = new CheckSpoiler(interaction);
                            await checkSpoiler.HandleCommand();
                            break;
                    }
                } catch (error) {
                    LogError(error);
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            });
            // Login to Discord with your client's token
            client.login(DiscordToken);
        } catch (error) {
            LogError(error);
        }
    }

    public async RegisterCommands()
    {
        StartUpLog("Registering discord commands");
        const commands = [
            new SlashCommandBuilder()
                .setName('burger')
                .setDescription('Burger Someone')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('user').setDescription('The person to burger')
                        .addUserOption(option => option.setName('target').setDescription('The user'))),
            new SlashCommandBuilder()
                .setName('check')
                .setDescription('Checks a spoiler image for a potential burgering')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('spoiler').setDescription('The URL of the image to check')
                        .addStringOption(option => option.setName('messageid').setDescription('The MessageID of the image to check'))),
            new SlashCommandBuilder()
                .setName('highscore')
                .setDescription('Burger Highscores'),
            new SlashCommandBuilder()
                .setName('balance')
                .setDescription('See your balance in crypto burger coins'),
            new SlashCommandBuilder()
                .setName('shop')
                .setDescription('See what you can buy in the shop.')
                .addIntegerOption(option =>
                    option
                        .setName('item')
                        .setDescription('What you would like to buy')),
            new SlashCommandBuilder()
                .setName('status')
                .setDescription('See your current status'),
            new SlashCommandBuilder()
                .setName('gamble')
                .setDescription('Wager a bet? Will you burger yourself or someone random?')
                .addIntegerOption(option => option.setRequired(true).setName('wager').setDescription('How much are you betting?'))
        ];
    
        const commandsAsJson = commands.map(command => command.toJSON());
        
        const rest = new REST({ version: '10' }).setToken(DiscordToken);
        
        const guilds = await this._database.GetAllGuilds();

        if (guilds.length === 0) {
            LogError("Cannot register any commands. No GuildIds are present");
        }

        guilds.forEach((guild: any) => {
            rest.put(Routes.applicationGuildCommands(ClientId, guild.id), { body: commandsAsJson })
            .then(() => LogInfo('Successfully registered application commands.'))
            .catch(console.error);
        })
    }
}