import { ChatInputCommandInteraction } from "discord.js";
import { IsUserOnCooldown, TimeDifferenceInMinutes } from "../../Helper";
import { ShopItem, ShopItems } from "../../Types/ShopItems";
import BaseCommand from "./BaseCommand";
import ICommand from "./interfaces/ICommand";

export default class Shop extends BaseCommand implements ICommand{

    private _interaction: ChatInputCommandInteraction;
    private _shopItems: any = null;

    constructor(interaction: ChatInputCommandInteraction)
    {
        super();

        this._interaction = interaction;
    }

    public async HandleCommand()
    {
        const item = this._interaction.options.getInteger('item');
        this._shopItems = await this._database.GetAllShopItems();
        const userId = this._interaction.user.id;

        if (item !== null && item !== undefined){
            this.PurchaseItem(item, userId);
            return;
        }

        const shopItemsAsString: string[] = [];

        this._shopItems.forEach((item: ShopItem) => shopItemsAsString.push(`${item.id}. ${item.name} = ${item.price}bc \n `))

        this._interaction.reply({
            content: `Welcome to the Burger Crypto Shop \n For sale we have \n ${shopItemsAsString} \n When you want to buy something do \n /shop item {insert item number}`,
            ephemeral: true
        });
        return;
    }

    private async PurchaseItem(item: number, userId: string) {
        try {

            const user = await this._database.GetUser(userId);
            const userWallet = await this._database.GetUserWallet(userId);
            const shopItem = this.GetItemFromAllShopItems(item);

            if (!(await this.UserCanBuyItem(shopItem, user, userWallet))){
                return;
            }

            if (item === ShopItems.Shield){
                await this._database.SetUserShield(user.id, true);
            }

            await this._userWallet.DecreaseUserWallet(user.id, shopItem.price);

            this._interaction.reply({
                content: `Congrats, you bought a ${shopItem.name}. It's been applied to your person!`,
                ephemeral: true
            });
        } catch (err: any) {
            this._interaction.reply({
                content: err.message,
                ephemeral: true
            });
        }
    }

    private async UserCanBuyItem(item: ShopItem, user: any, userWallet: any): Promise<boolean>{
        const userCooldown = await this._database.GetUserCooldown(user.id);

        if (IsUserOnCooldown(userCooldown)) {
            this._interaction.reply({
                content: `You can't currently buy this. You are on a cooldown for ${TimeDifferenceInMinutes(userCooldown)}`,
                ephemeral: true
            });
            return false;
        }

        if (userWallet.amountInWallet < item.price) {
            this._interaction.reply({
                content: `You can't currently buy this. You do not have enough money in your wallet`,
                ephemeral: true
            });
            return false;
        }

        return true;
    }

    private GetItemFromAllShopItems(itemValue: number): ShopItem {
        const item = this._shopItems.find((item: any) => item.id === itemValue);
        
        if (item === null || item === undefined){
            throw new Error("Not a valid item");   
        }

        return item;
    }
}

