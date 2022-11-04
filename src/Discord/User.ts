import { ChatInputCommandInteraction } from "discord.js";
import BaseCommand from "./Commands/BaseCommand";

export default class User extends BaseCommand {

    private _interaction: ChatInputCommandInteraction;

    public constructor(interaction: ChatInputCommandInteraction)
    {
        super();

        this._interaction = interaction;
    }

    public async AddUser()
    {
        const userId = this._interaction.user.id;
        const user = await this._database.GetUser(userId);

        if (user === null){
            await this._database.CreateUser(userId);
        }
    }

}

