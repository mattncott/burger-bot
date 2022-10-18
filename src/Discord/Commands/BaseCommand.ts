import IDatabase from "../../Data/Interfaces/IDatabase";
import SequelizeDatabase from "../../Data/SequelizeDatabase";

export default class BaseCommand 
{

    protected _database: IDatabase;

    constructor()
    {
        this._database = new SequelizeDatabase();
    }
}