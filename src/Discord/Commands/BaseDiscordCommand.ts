import IDatabase from "../../Data/Interfaces/IDatabase";
import SequelizeDatabase from "../../Data/SequelizeDatabase";
import IUserWallet from "../../Data/Interfaces/IUserWallet";
import { UserWallet } from "../../Data/UserWallet";
import { Client } from "discord.js";
import BaseDiscord from "../BaseDiscord";

export default class BaseDiscordCommand extends BaseDiscord
{

    protected readonly _database: IDatabase;
    protected readonly _userWallet: IUserWallet;

    constructor(discordClient: Client, database?: IDatabase, userWallet?: IUserWallet)
    {
        super(discordClient);
        this._database = database === null || database === undefined ? new SequelizeDatabase() : database;
        this._userWallet = userWallet === null || userWallet === undefined ? new UserWallet(this._database) : userWallet;
    }
}