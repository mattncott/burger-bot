import IDatabase from "../Data/Interfaces/IDatabase";
import SequelizeDatabase from "../Data/SequelizeDatabase";

export class BaseDiscordBot {
    protected readonly _database: IDatabase;

    constructor(database?: IDatabase) {
        this._database = database === null || database === undefined ? new SequelizeDatabase() : database;
    }
}