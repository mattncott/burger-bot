import { ChatInputCommandInteraction, userMention } from "discord.js";
import IDatabase from "../../Data/Interfaces/IDatabase";
import IUserWallet from "../../Data/Interfaces/IUserWallet";
import { getRandomInt } from "../../Helper";
import BaseCommand from "./BaseCommand";
import Burger from "./Burger";
import ICommand from "./interfaces/ICommand";

export default class Gamble extends BaseCommand implements ICommand{

    private _interaction: ChatInputCommandInteraction;
    private _burgerClass: Burger;

    constructor(interaction: ChatInputCommandInteraction, database?: IDatabase, userWallet?: IUserWallet)
    {
        super(database, userWallet);

        this._burgerClass = new Burger(interaction, database, userWallet);
        this._interaction = interaction;
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

        // TODO max user bet

        const landedOnRandom = this.GetWhoToLandOnRandomOrYourself();

        if (landedOnRandom) {
            const allUserIds = (await this._database.GetAllUserIds()).filter((userId: string) => userId !== selectedUserId);

            console.log("allUserIds")
            console.log(allUserIds);

            if (allUserIds.length === 0){
                this._interaction.reply(`Not enough users have interacted with the burger bot to play roulette yet.`);
                return;   
            }

            const randomPosition = Math.floor(Math.random() * allUserIds.length);
            selectedUserId = allUserIds[randomPosition];
        }

        if (selectedUserId !== userPlaying){
            await this._burgerClass.SetSuccessBurgerDatabaseValues(userPlaying, selectedUserId, false);
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
        console.log(value);
        // if the number is even, its landed on a random person
        return value % 2 === 0;
    }

}

