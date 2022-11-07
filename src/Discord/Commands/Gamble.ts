import { ChatInputCommandInteraction, Client, userMention } from "discord.js";
import IDatabase from "../../Data/Interfaces/IDatabase";
import IUserWallet from "../../Data/Interfaces/IUserWallet";
import { getRandomInt } from "../../Helper";
import BaseDiscordCommand from "./BaseDiscordCommand";
import Burger from "./Burger";
import ICommand from "./interfaces/ICommand";

export default class Gamble extends BaseDiscordCommand implements ICommand{

    private _interaction: ChatInputCommandInteraction;
    private _burgerClass: Burger;
    // private _guildId: string | null;

    constructor(interaction: ChatInputCommandInteraction, discordClient: Client, database?: IDatabase, userWallet?: IUserWallet)
    {
        super(discordClient, database, userWallet);

        this._burgerClass = new Burger(interaction, discordClient, database, userWallet);
        this._interaction = interaction;
    }

    private GetGuildId()
    {
        return this._interaction.guildId;
    }

    private GetTargetWager()
    {
        const wager = this._interaction.options.getInteger('wager');
        return wager === null ? 0 : wager;
    }

    public async HandleCommand()
    {
        const wager = this.GetTargetWager();
        const userPlaying = this._interaction.user.id;
        let selectedUserId = this._interaction.user.id;
        const guildId = this.GetGuildId();

        if (guildId === null) {
            this._interaction.reply("This command is only allowed from within a server.");
            return;
        }

        if (0 >= wager) {
            this._interaction.reply({
                content: `You must wager more than 0 bc to play this game`,
                ephemeral: true,
            });
            return;
        }

        if (!(await this._userWallet.CheckTheresEnoughMoneyInWallet(userPlaying, wager))){
            this._interaction.reply({
                content: `You do not have enough money to bet this much. Check your balance with /balance`,
                ephemeral: true,
            });

            return;
        }

        if (await this._userWallet.WagerIsOverMaxUserBet(userPlaying, wager)) {
            this._interaction.reply({
                content: `You cannot bet this much. The max you can bet is ${await this._userWallet.GetMaxAllowedBet(userPlaying)} bc`,
                ephemeral: true,
            });

            return;
        }

        const landedOnRandom = this.GetWhoToLandOnRandomOrYourself();

        if (landedOnRandom) {
            // Get all users from highscores as that'll be the most complete
            const allUserIds = (await this._database.GetAllHighscores(guildId)).filter((user: any) => user.id !== userPlaying);

            if (allUserIds.length === 0){
                this._interaction.reply(`Not enough users have interacted with the burger bot to play roulette yet.`);
                return;   
            }

            const randomPosition = Math.floor(Math.random() * allUserIds.length);
            selectedUserId = allUserIds[randomPosition].id;
        }

        if (selectedUserId !== userPlaying){
            await this._burgerClass.SetSuccessBurgerDatabaseValues(selectedUserId, userPlaying, false);
            await this._userWallet.IncreaseUserWalletByAmount(userPlaying, wager);
            this._interaction.reply(`${userMention(userPlaying)} played roulette and just burgered ${userMention(selectedUserId)} and won ${wager} bc`);
        } else {
            await this._burgerClass.SetUserFailedBurgerDatabaseValues(userPlaying);
            await this._userWallet.DecreaseUserWallet(userPlaying, wager);
            this._interaction.reply(`${userMention(userPlaying)} played roulette and just burgered themselves and lost ${wager} bc`);
        }
    }

    private GetWhoToLandOnRandomOrYourself(): Boolean {
        const value = getRandomInt(0, 1000000);
        // if the number is even, its landed on a random person
        return value % 2 === 0;
    }

}

