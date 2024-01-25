import { ChatInputCommandInteraction } from "discord.js";
import IDatabase from "../../Data/Interfaces/IDatabase";
import IUserWallet from "../../Data/Interfaces/IUserWallet";
import { IsUserOnCooldown, TimeDifferenceInMinutes } from "../../Helper";
import { ShopItem, ShopItems } from "../../Types/ShopItems";
import BaseCommand from "./BaseCommand";
import ICommand from "./interfaces/ICommand";

export default class Shop extends BaseCommand implements ICommand{

    private _interaction: ChatInputCommandInteraction;
    private _shopItems: any = null;

    constructor(interaction: ChatInputCommandInteraction, database?: IDatabase, userWallet?: IUserWallet)
    {
        super(database, userWallet);

        this._interaction = interaction;
    }

    private GetTargetItem() {
        return this._interaction.options.getInteger('item');
    }

    public async HandleCommand()
    {
        const item = this.GetTargetItem();
        this._shopItems = await this._database.GetAllShopItems();
        const userId = this._interaction.user.id;

        if (item != null){
            this.PurchaseItem(item, userId);
            return;
        }

        const shopItemsAsString = Shop.CreateShopItemsString(this._shopItems);

        this._interaction.reply({
            content: `Welcome to the Burger Crypto Shop \n For sale we have \n ${shopItemsAsString} \n When you want to buy something do \n /shop item {insert item number}`,
            ephemeral: true
        });
        return;
    }

    private async PurchaseItem(item: number, userId: string) {
        try {

            const user = await this._database.GetUser(userId);
            const userWallet = await this._userWallet.Get(userId);
            const shopItem = this.GetItemFromAllShopItems(item);

            if (!this.UserCanBuyItem(shopItem, user, userWallet)) {
                return;
            }

            if (item === ShopItems.Shield){
                await this._database.SetUserShield(user.id, true);
            }

            if (item === ShopItems.ShieldPenetrator){
                await this._database.SetUserShieldPenetratorStatus(user.id, true);
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

    private UserCanBuyItem(item: ShopItem, user: any, userWallet: any): boolean{
        if (IsUserOnCooldown(user.coolDown)) {
            this._interaction.reply({
                content: `You can't currently buy this. You are on a cooldown for ${TimeDifferenceInMinutes(user.coolDown)}`,
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

        if (item.id === ShopItems.ShieldPenetrator && user.hasShield){
            this._interaction.reply({
                content: `You can't currently buy this. You already have a shield enabled`,
                ephemeral: true
            });
            return false;
        }

        if (item.id === ShopItems.Shield && user.hasShieldPenetrator){
            this._interaction.reply({
                content: `You can't currently buy this. You already have a shield penetrator enabled`,
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

    public static CreateShopItemsString(shopItems: ShopItem[])
    {
        const shopItemsAsString: string[] = [];

        shopItems.forEach((item: ShopItem) => shopItemsAsString.push(`------------------------\n ${item.id}. ${item.name} = ${item.price}bc \n ${item.description} \n`));

        return shopItemsAsString;
    }
}

