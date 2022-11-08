import { ChatInputCommandInteraction, Client, Guild, User, userMention } from "discord.js";
import IDatabase from "../../Data/Interfaces/IDatabase";
import IUserWallet from "../../Data/Interfaces/IUserWallet";
import { IsUserOnCooldown, TimeDifferenceInMinutes } from "../../Helper";
import { Roles } from "../../Types/Roles";
import BaseDiscordCommand from "./BaseDiscordCommand";
import ICommand from "./interfaces/ICommand";
import { User as UserType } from "../../types/User";

export default class Burger extends BaseDiscordCommand implements ICommand {

    private readonly _interaction: ChatInputCommandInteraction;
    private readonly _guildId: string | null;

    constructor(interaction: ChatInputCommandInteraction, discordClient: Client, database?: IDatabase, userWallet?: IUserWallet)
    {
        super(discordClient, database, userWallet);

        this._interaction = interaction;
        this._guildId = interaction.guildId;
    }

    private GetTargetUser()
    {
        return this._interaction.options.getUser('target');
    }

    public async HandleCommand()
    {

        if (this._guildId === null){
            this._interaction.reply("This command is only allowed from within a server.");
            return;
        }

        let targetUser = this.GetTargetUser();
        

        const sendingUser = this._interaction.user;

        if (targetUser === null) {
            targetUser = sendingUser;
        }



        await this._database.GetUser(targetUser.id);


        try {
            await this.UserIsAllowedToBurger(sendingUser.id);
        } catch (err: any) {
            this._interaction.reply({
                content: err.message,
                ephemeral: true
            });
            
            return;
        }

        const targetUserHasShield = await this._database.GetUserShieldStatus(targetUser.id);
        const sendingUserHasShieldPenetrator = await this._database.GetUserShieldPenetratorStatus(sendingUser.id);


        if (await this.ProcessIfUserHasShield(targetUserHasShield, sendingUserHasShieldPenetrator, targetUser, sendingUser)){
            return;
        }

        let interactionReplyMessage = `${userMention(sendingUser.id)} just burgered ${userMention(targetUser.id)}`;

        if (sendingUserHasShieldPenetrator){
            await this._database.SetUserShieldPenetratorStatus(sendingUser.id, false);
            interactionReplyMessage = `Rippage ${userMention(sendingUser.id)} wasted their shield penetrator and just burgered ${userMention(targetUser.id)}, they did not have a shield`;
        }
        
        await this.SetSuccessBurgerDatabaseValues(targetUser.id, sendingUser.id);
        await this._interaction.reply(interactionReplyMessage);
    }

    public async UserIsAllowedToBurger(userId: string): Promise<void>
    {
        const user = await this._database.GetUser(userId);

        if (IsUserOnCooldown(user?.coolDown)) {
            throw new Error(`You can't send a Burger right now. You're on a cooldown for ${TimeDifferenceInMinutes(user.coolDown)} minutes`);
        }
    }

    private async ProcessIfUserHasShield(targetUserHasShield: boolean, userShieldPentratorStatus: boolean, targetUser: User, sendingUser: User): Promise<boolean> {

        if (targetUserHasShield) {
            await this._database.SetUserShield(targetUser.id, false);
            let interactionReplyMessage = `Ouch! ${userMention(targetUser.id)} had a shield! You just burgered YOURSELF ${userMention(sendingUser.id)}`;

            if (userShieldPentratorStatus) {
                interactionReplyMessage = `${userMention(sendingUser.id)} used their shield penetrator and just burgered ${userMention(targetUser.id)}`
                await this._database.SetUserShieldPenetratorStatus(sendingUser.id, false);
                this.SetSuccessBurgerDatabaseValues(targetUser.id, sendingUser.id);

                this._interaction.reply(interactionReplyMessage);
                return true;
            }

            this.SetUserFailedBurgerDatabaseValues(sendingUser.id);

            this._interaction.reply(interactionReplyMessage);

            return true;
        }

        return false;
    }

    public async SetSuccessBurgerDatabaseValues(targetUserId: string, sendingUserId: string, increaseUserWallet = true): Promise<void>{
        await this.UpdateUserBurgeredRole(targetUserId);

        await this._database.SetBurgered(targetUserId, true);
        await this._database.SetHighscores(targetUserId, true, this.GetGuildId());
        await this._database.SetHighscores(sendingUserId, false, this.GetGuildId());
        await this._database.SetUserCooldown(sendingUserId);

        if (increaseUserWallet){
            await this._userWallet.IncreaseUserWallet(sendingUserId);
        }
    }

    public async SetUserFailedBurgerDatabaseValues(sendingUserId: string): Promise<void>{
        await this._database.SetHighscores(sendingUserId, true, this.GetGuildId());
        await this._database.SetBurgered(sendingUserId, true);
        await this._database.SetUserCooldown(sendingUserId);
        await this.UpdateUserBurgeredRole(sendingUserId);
    }

    private async UpdateUserBurgeredRole(userId: string): Promise<void>
    {
        const role = await this.GetOrCreateRole(Roles.Burgered, {}, this.GetGuild());
        await this.AddUserToRole(this.GetGuild(), role, userId);
    }

    private GetGuild(): Guild {
        if (this._interaction.guild === null) {
            // this condition shouldn't evaluate. It will never get this far
            throw new Error("Guild is null");
        }

        return this._interaction.guild;
    }

    private GetGuildId(): string {
        if (this._guildId === null) {
            // this condition shouldn't evaluate. It will never get this far.
            throw new Error("Guild Id is null");
        }

        return this._guildId;
    }
}