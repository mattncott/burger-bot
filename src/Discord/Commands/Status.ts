import { ChatInputCommandInteraction } from "discord.js";
import { IsUserOnCooldown, TimeDifferenceInMinutes } from "../../Helper";
import BaseCommand from "./BaseCommand";
import ICommand from "./interfaces/ICommand";

export default class Status extends BaseCommand implements ICommand{

    private _interaction: ChatInputCommandInteraction;

    constructor(interaction: ChatInputCommandInteraction)
    {
        super();

        this._interaction = interaction;
    }

    public async HandleCommand()
    {
        const userId = this._interaction.user.id;
        const user = await this._database.GetUser(userId);
        const userWallet = await this._userWallet.Get(userId);

        this._interaction.reply({
            content: `Shield Status: ${user.hasShield ? "Enabled" : "Disabled"} \n`
                +`Cooldown status: ${!IsUserOnCooldown(user.coolDown) ? "None" : `${TimeDifferenceInMinutes(user.coolDown)} minutes`}\n`
                +`Balance: ${userWallet.amountInWallet} bc`,
            ephemeral: true
        });
    }

}

