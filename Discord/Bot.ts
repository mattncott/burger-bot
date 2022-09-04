import { Client, GatewayIntentBits } from "discord.js";
import { DiscordToken } from "../BurgerBotStart";
import Burger from "./Commands/Burger";
import HighScore from "./Commands/Highscore";
import { LogInfo } from "./Logger";

export function StartBot() {
    (async () => {
        var client: Client;
        try {
            // Create a new client instance
            client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

            // When the client is ready, run this code (only once)
            client.once('ready', () => {
                LogInfo('Ready!');

                client.on('messageCreate', message => {
                    LogInfo('message');
                    if (message.content === 'burger'){
                        message.channel.send('burger');
                    }
                });
            });

            // Login to Discord with your client's token
            client.login(DiscordToken);
        } catch (error) {
            LogInfo(error);
        }

        client.on('interactionCreate', async interaction => {
            if (!interaction.isChatInputCommand()) return;

            try {                
                const { commandName } = interaction;
            
                switch (commandName) {
                    case 'ping':
                        await interaction.reply('Pong!');
                        break;
                    case 'server':
                        await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
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
                }
            } catch (error) {
                console.log(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        });
        

    })();
}