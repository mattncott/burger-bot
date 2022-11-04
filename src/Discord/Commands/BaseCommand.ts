import IDatabase from "../../Data/Interfaces/IDatabase";
import SequelizeDatabase from "../../Data/SequelizeDatabase";
import IUserWallet from "../../Data/Interfaces/IUserWallet";
import { UserWallet } from "../../Data/UserWallet";

export default class BaseCommand 
{

    protected readonly _database: IDatabase;
    protected readonly _userWallet: IUserWallet;

    constructor()
    {
        this._database = new SequelizeDatabase();
        this._userWallet = new UserWallet(this._database);
    }
}