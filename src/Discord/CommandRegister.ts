import { SlashCommandBuilder, Routes } from 'discord.js';
import { REST }  from '@discordjs/rest';
import { DiscordToken, clientId, guildId, IsDevelopmentEnv } from '../index';
import { LogInfo } from '../Logger';

export function RegisterCommands(){
    const commands = [
        new SlashCommandBuilder()
            .setName('burger')
            .setDescription('Burger Someone')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('user').setDescription('The person to burger')
                    .addUserOption(option => option.setName('target').setDescription('The user'))),
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
    ];

    if (IsDevelopmentEnv){
        commands.push(new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
        new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
        new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'));
    }

    var commandsAsJson = commands.map(command => command.toJSON());
    
    const rest = new REST({ version: '10' }).setToken(DiscordToken);
    
    rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandsAsJson })
        .then(() => LogInfo('Successfully registered application commands.'))
        .catch(console.error);
}