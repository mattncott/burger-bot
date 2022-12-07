import IDatabase from "./Interfaces/IDatabase";
import IUserWallet from "./Interfaces/IUserWallet";

export class UserWallet implements IUserWallet {

    private readonly _database: IDatabase;
    private readonly _baseWalletIncrease = 1;
    private readonly _maxAllowedBet = 10;

    constructor(database: IDatabase)
    {
        this._database = database;
    }

    public async Get(userId: string): Promise<any> {
        return await this._database.GetUserWallet(userId);
    }

    public async IncreaseUserWallet(userId: string): Promise<void> {
        // TODO Does the user have any wallet multipliers??? If so increase this value
        const walletIncreaseBy = this._baseWalletIncrease;

        await this.IncreaseUserWalletByAmount(userId, walletIncreaseBy);
    }

    public async DecreaseUserWallet(userId: string, walletDecreaseBy: number): Promise<void> {
        const userWallet = await this._database.GetUserWallet(userId);

        if (userWallet.amountInWallet < walletDecreaseBy) {
            throw new Error ("Cannot Purchase, not enough money in wallet.");
        }

        await this.UpdateWalletAmount(userId, userWallet.amountInWallet - walletDecreaseBy);
    }

    public async CheckTheresEnoughMoneyInWallet(userId: string, amountToCheck: number): Promise<boolean>{
        const userWallet = await this._database.GetUserWallet(userId);
        return userWallet.amountInWallet >= amountToCheck;
    }

    public async IncreaseUserWalletByAmount(userId: string, increaseByAmount: number): Promise<void>{
        const userWallet = await this._database.GetUserWallet(userId);
        await this.UpdateWalletAmount(userId, userWallet.amountInWallet + increaseByAmount);
    }

    public async WagerIsOverMaxUserBet(userPlaying: string, wager: number): Promise<boolean>{
        const maxUserAllowedBet = await this.GetMaxAllowedBet(userPlaying);
        // TODO Does the user have any wallet multipliers??? If so increase this value
        return maxUserAllowedBet < wager;
    }

    // TODO unit test this method
    public async GetMaxAllowedBet(userPlaying: string): Promise<number>{
        const maxUserAllowedBet = this._maxAllowedBet;
        // TODO Does the user have any wallet multipliers??? If so increase this value
        return maxUserAllowedBet;
    }

    private async UpdateWalletAmount(userId: string, amount: number): Promise<void>{
        await this._database.UpdateUserWallet(userId, amount);
    }
}