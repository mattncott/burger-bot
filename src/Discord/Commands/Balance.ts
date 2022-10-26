import { ChatInputCommandInteraction } from "discord.js";
import BaseCommand from "./BaseCommand";
import ICommand from "./interfaces/ICommand";

export default class Balance extends BaseCommand implements ICommand{

    private _interaction: ChatInputCommandInteraction;

    constructor(interaction: ChatInputCommandInteraction)
    {
        super();

        this._interaction = interaction;
    }

    public async HandleCommand()
    {
        const userId = this._interaction.user.id;
        const userWallet = await this._database.GetUserWallet(userId);
        this._interaction.reply({
            content: `You have ${userWallet.amountInWallet} crypto burger coins. Use /shop to see what you can buy`,
            ephemeral: true
        });
    }

}

