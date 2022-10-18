import { ChatInputCommandInteraction, userMention } from "discord.js";
import { HighScoreType } from "../../Types/HighScoreType";
import BaseCommand from "./BaseCommand";
import ICommand from "./interfaces/ICommand";

export default class HighScore extends BaseCommand implements ICommand{

    private _interaction: ChatInputCommandInteraction;

    constructor(interaction: ChatInputCommandInteraction)
    {
        super();

        this._interaction = interaction;
    }

    public async HandleCommand()
    {
        var highscores = await this._database.GetAllHighscores();
        console.log(highscores);

        const tableResponse: string[] = [];
        
        highscores.forEach((highScore: HighScoreType) => tableResponse.push(
            `${userMention(highScore.id)} \n Number of time burgered: ${highScore.numberOfTimesBurgered} \n Number of burgerings performed: ${highScore.numberOfBurgers} \n\n`
            ));

        await this._interaction.reply(tableResponse.toString().replace(',', ''));
    }

}

