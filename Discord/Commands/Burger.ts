import { ChatInputCommandInteraction, userMention } from "discord.js";
import BaseCommand from "./BaseCommand";
import ICommand from "./interfaces/ICommand";

export default class Burger extends BaseCommand implements ICommand{

    private _interaction: ChatInputCommandInteraction;

    constructor(interaction: ChatInputCommandInteraction)
    {
        super();

        this._interaction = interaction;
    }

    public async HandleCommand()
    {
        var targetUser = this._interaction.options.getUser('target');
        var sendingUser = this._interaction.user;
        await this._database.SetHighscores(targetUser.id, true);
        await this._database.SetHighscores(sendingUser.id, false);
        
        await this._interaction.reply(`${userMention(sendingUser.id)} just burgered ${userMention(targetUser.id)}`);
    }

}

