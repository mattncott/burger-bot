import { ChatInputCommandInteraction, userMention } from "discord.js";
import BaseCommand from "./BaseCommand";
import ICommand from "./interfaces/ICommand";

export default class Burger extends BaseCommand implements ICommand {

    private _interaction: ChatInputCommandInteraction;

    private readonly _successfulBurgerPrice = 1;

    constructor(interaction: ChatInputCommandInteraction)
    {
        super();

        this._interaction = interaction;
    }

    public async HandleCommand()
    {
        let targetUser = this._interaction.options.getUser('target');

        const sendingUser = this._interaction.user;

        if (targetUser === null) {
            targetUser = sendingUser;
        }

        const user = await this._database.GetUser(sendingUser.id);

        if (!(await this.CanSendABurger(user.coolDown))) {
            this._interaction.reply({
                content: `You can't send a Burger right now. You're on a cooldown for ${this.TimeDifferenceInMinutes(user.coolDown)} minutes`
            });
            return;
        }

        var targetUserHasShield = await this._database.GetUserShieldStatus(targetUser.id);

        if (targetUserHasShield) {
            this._interaction.reply(`Ouch! ${userMention(targetUser.id)} had a shield! You just burgered YOURSELF ${userMention(sendingUser.id)}`);

            await this._database.SetHighscores(sendingUser.id, true);
            await this._database.SetUserShield(targetUser.id, false);
            await this._database.SetUserCooldown(sendingUser.id);

            return;
        }
        
        const userWallet = await this._database.GetUserWallet(sendingUser.id);

        await this._database.SetHighscores(targetUser.id, true);
        await this._database.SetHighscores(sendingUser.id, false);
        await this._database.SetUserCooldown(sendingUser.id);
        await this._database.UpdateUserWallet(sendingUser.id, userWallet.amountInWallet + this._successfulBurgerPrice)
        
        await this._interaction.reply(`${userMention(sendingUser.id)} just burgered ${userMention(targetUser.id)}`);
    }

    private async CanSendABurger(userCooldown: Date): Promise<boolean> {

        if (userCooldown !== null && userCooldown !== undefined) {
            const now = new Date();
            console.log(now);
            console.log(userCooldown);
            return userCooldown < now;
        }

        return true;
    }

    private TimeDifferenceInMinutes(dt2: Date) 
    {
        const dt1 = new Date();
        var diff =(dt2.getTime() - dt1.getTime()) / 1000;
        diff /= 60;
        return Math.abs(Math.round(diff));
    }
}