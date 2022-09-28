import FirebaseDatabase from "../../Data/FirebaseDatabase";
import IDatabase from "../../Data/Interfaces/IDatabase";

export default class BaseCommand 
{

    protected _database: IDatabase;

    constructor()
    {
        this._database = new FirebaseDatabase();
    }
}