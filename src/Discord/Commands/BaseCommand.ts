import IDatabase from "../../Data/Interfaces/IDatabase";
import SequelizeDatabase from "../../Data/SequelizeDatabase";
import IUserWallet from "../../Data/Interfaces/IUserWallet";
import { UserWallet } from "../../Data/UserWallet";

export default class BaseCommand 
{

    protected readonly _database: IDatabase;
    protected readonly _userWallet: IUserWallet;

    constructor(database?: IDatabase, userWallet?: IUserWallet)
    {
        this._database = database === null || database === undefined ? new SequelizeDatabase() : database;
        this._userWallet = userWallet === null || userWallet === undefined ? new UserWallet(this._database) : userWallet;
    }
}