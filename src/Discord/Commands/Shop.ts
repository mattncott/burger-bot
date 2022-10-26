import { ChatInputCommandInteraction } from "discord.js";
import BaseCommand from "./BaseCommand";
import ICommand from "./interfaces/ICommand";

enum ShopItems {
    Shield = 1,
};

export default class Shop extends BaseCommand implements ICommand{

    private _interaction: ChatInputCommandInteraction;

    private readonly _shieldPrice = 10;

    constructor(interaction: ChatInputCommandInteraction)
    {
        super();

        this._interaction = interaction;
    }

    public async HandleCommand()
    {
        const item = this._interaction.options.getInteger('item');
        const userId = this._interaction.user.id;
        console.log(`item ${item}`);

        if (item !== null && item !== undefined){
            // buy something
            console.log('buying something');
            this.ProcessPurchase(item, userId);
            return;
        }

        this._interaction.reply({
            content: `Welcome to the Burger Crypto Shop \n For sale we have \n 1. Shield = ${this._shieldPrice}bc \n \n When you want to buy something do \n /shop item {insert item number}`,
            ephemeral: true
        });
        return;
    }

    private async ProcessPurchase(item: number, userId: string) {
        try {

            const user = await this._database.GetUser(userId);
            const userWallet = await this._database.GetUserWallet(userId);

            // Validate this is an actual item
            const itemAsString = this.GetStringFromItemValue(item);

            if (item === ShopItems.Shield){
                await this._database.SetUserShield(user.id, true);
                await this._database.UpdateUserWallet(user.id, userWallet.amountInWallet - this._shieldPrice);
            }

            this._interaction.reply({
                content: `Congrats, you bought a ${itemAsString}. It's been applied to your person!`,
                ephemeral: true
            });
        } catch (err: any) {
            this._interaction.reply({
                content: err.message,
                ephemeral: true
            });
        }
    }

    private GetStringFromItemValue(itemValue: number) {
        switch (itemValue){
            case ShopItems.Shield:
                return "Shield";
            default:
                throw new Error("Not a valid item");
        }
    }

}

