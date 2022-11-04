import { ChatInputCommandInteraction } from "discord.js";
import IDatabase from "../../Data/Interfaces/IDatabase";
import IUserWallet from "../../Data/Interfaces/IUserWallet";
import BaseCommand from "./BaseCommand";
import ICommand from "./interfaces/ICommand";

export default class Balance extends BaseCommand implements ICommand{

    private _interaction: ChatInputCommandInteraction;

    constructor(interaction: ChatInputCommandInteraction, database?: IDatabase, userWallet?: IUserWallet)
    {
        super(database, userWallet);

        this._interaction = interaction;
    }

    public async HandleCommand()
    {
        const userId = this._interaction.user.id;
        const userWallet = await this._userWallet.Get(userId);
        this._interaction.reply({
            content: `You have ${userWallet.amountInWallet} crypto burger coins. Use /shop to see what you can buy`,
            ephemeral: true
        });
    }

}

