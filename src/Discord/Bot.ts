import { Client, GatewayIntentBits } from "discord.js";
import { DiscordToken } from "../index";
import { LogError } from "../Logger";
import Balance from "./Commands/Balance";
import Burger from "./Commands/Burger";
import HighScore from "./Commands/Highscore";
import Shop from "./Commands/Shop";
import Status from "./Commands/Status";
import User from "./User";

export function StartBot() {
    (async () => {
        var client = null as unknown as Client;
        try {
            // Create a new client instance
            client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

            // When the client is ready, run this code (only once)
            client.once('ready', () => {
                console.log('Bot is online!');
            });

            client.on('interactionCreate', async interaction => {
                if (!interaction.isChatInputCommand()) return;
    
                try {                
                    const { commandName } = interaction;

                    // When a user sends a command, add them to the system.
                    const userClass = new User(interaction);
                    userClass.AddUser();
                
                    switch (commandName) {
                        case 'ping':
                            await interaction.reply('Pong!');
                            break;
                        case 'server':
                            await interaction.reply(`Server name: ${interaction.guild?.name}\nTotal members: ${interaction.guild?.memberCount}`);
                            break;
                        case 'user':
                            await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
                            break;
                        case 'burger':
                            const burgerClass = new Burger(interaction);
                            await burgerClass.HandleCommand();
                            break;
                        case 'highscore':
                            const highscoreClass = new HighScore(interaction);
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
    })();
}