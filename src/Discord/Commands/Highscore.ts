import { ChatInputCommandInteraction, Client, userMention } from "discord.js";
import IDatabase from "../../Data/Interfaces/IDatabase";
import { LogInfo } from "../../Logger";
import { HighScoreType } from "../../Types/HighScoreType";
import { Roles } from "../../Types/Roles";
import BaseDiscordCommand from "./BaseDiscordCommand";
import ICommand from "./interfaces/ICommand";

export default class HighScore extends BaseDiscordCommand implements ICommand{

    private readonly _interaction: ChatInputCommandInteraction;
    private readonly _guildId: string | null;

    constructor(interaction: ChatInputCommandInteraction, discordClient: Client, database?: IDatabase)
    {
        super(discordClient, database);

        this._interaction = interaction;
        this._guildId = interaction.guildId;
    }

    public async HandleCommand()
    {

        if (this._guildId === null) {
            this._interaction.reply("This command is only allowed from within a server.");
            return;
        }

        var highscores = await this._database.GetAllHighscores(this._guildId);

        if (highscores.length === 0) {
            await this._interaction.reply({
                content: "No highscores have been created yet. Burger someone to get started!",
                ephemeral: true
            });

            return;
        }

        await this._interaction.reply(this.FormatHighScoreArrayToString(highscores));
    }

    public async CalculateMostBurgeredToday()
    {
        LogInfo("Calculating who is most burgered today")
        const allGuildIds = await this._database.GetAllGuilds();

        for (let i = 0; allGuildIds.length - 1>= i; i++){
            const guild = this.GetDiscordGuild(allGuildIds[i].id);

            const mostBurgeredRole = await this.GetOrCreateRole(Roles.MostBurgered, {}, guild);
            const mostBurgeredUser = mostBurgeredRole.members.first();
            if (mostBurgeredUser !== undefined){
                console.log('has most burgered');
                await this.RemoveUserFromRole(guild, mostBurgeredRole, mostBurgeredUser.id);
            }

            const allHighscoresForGuild = await this._database.GetAllHighscores(guild.id);

            if (allHighscoresForGuild.length === 0) {
                LogInfo(`No highscores for guild ${guild.id}`)
                return;
            }
            const mostBurgered = allHighscoresForGuild.reduce((p: HighScoreType, c: HighScoreType) => p.numberOfTimesBurgered >= c.numberOfTimesBurgered ? p : c);
            await this.AddUserToRole(guild, mostBurgeredRole, mostBurgered.userId);

            const channel = await this.GetChannelToSendMessageTo(guild);

            LogInfo(channel?.id);
            if (channel !== undefined){
                this.SendMessageToChannel(channel.id, `${userMention(mostBurgered.userId)} was the most burgered today! They've been given the most burgered role!`);
            }
        }

        await this._database.ClearHighscores();
    }


    private FormatHighScoreArrayToString(highscores: HighScoreType[]): string
    {
        const tableResponse: string[] = [];
        
        highscores.forEach((highScore: HighScoreType) => tableResponse.push(
            `${userMention(highScore.userId)} \n Number of time burgered: ${highScore.numberOfTimesBurgered} \n Number of burgerings performed: ${highScore.numberOfBurgers} \n\n`
            ));

        return tableResponse.toString().replace(',', '');
    }
}

