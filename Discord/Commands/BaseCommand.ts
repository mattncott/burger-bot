import SequelizeDatabase from "./SequelizeDatabase";

export default class BaseCommand 
{

    protected _database: SequelizeDatabase;

    constructor()
    {
        this._database = new SequelizeDatabase();
    }
}