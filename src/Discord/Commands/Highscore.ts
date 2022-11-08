import { ChatInputCommandInteraction, userMention } from "discord.js";
import IDatabase from "../../Data/Interfaces/IDatabase";
import { HighScoreType } from "../../Types/HighScoreType";
import BaseCommand from "./BaseCommand";
import ICommand from "./interfaces/ICommand";

export default class HighScore extends BaseCommand implements ICommand{

    private readonly _interaction: ChatInputCommandInteraction;
    private readonly _guildId: string | null;

    constructor(interaction: ChatInputCommandInteraction, database?: IDatabase)
    {
        super(database);

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


    public FormatHighScoreArrayToString(highscores: HighScoreType[]): string
    {
        const tableResponse: string[] = [];
        
        highscores.forEach((highScore: HighScoreType) => tableResponse.push(
            `${userMention(highScore.userId)} \n Number of time burgered: ${highScore.numberOfTimesBurgered} \n Number of burgerings performed: ${highScore.numberOfBurgers} \n\n`
            ));

        return tableResponse.toString().replace(',', '');
    }
}

