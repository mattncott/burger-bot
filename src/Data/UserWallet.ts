import IDatabase from "./Interfaces/IDatabase";
import IUserWallet from "./Interfaces/IUserWallet";

export class UserWallet implements IUserWallet {

    private readonly _database: IDatabase;
    private readonly _baseWalletIncrease = 1;

    constructor(database: IDatabase)
    {
        this._database = database;
    }

    public async IncreaseUserWallet(userId: string): Promise<void> {
        const userWallet = await this._database.GetUserWallet(userId);

        // TODO Does the user have any wallet multipliers??? If so increase this value
        var walletIncreaseBy = this._baseWalletIncrease;

        await this._database.UpdateUserWallet(userId, userWallet.amountInWallet + walletIncreaseBy)
    }

    public async DecreaseUserWallet(userId: string, walletDecreaseBy: number): Promise<void> {
        const userWallet = await this._database.GetUserWallet(userId);

        if (userWallet.amountInWallet < walletDecreaseBy) {
            throw new Error ("Cannot Purchase, not enough money in wallet.");
        }

        await this._database.UpdateUserWallet(userId, userWallet.amountInWallet - walletDecreaseBy)
    }
}