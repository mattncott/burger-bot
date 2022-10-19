import { Sequelize } from "sequelize";
import * as sequelize from "sequelize";
import IDatabase from "./Interfaces/IDatabase";
import { DatabaseHost, DatabaseType, IsDevelopmentEnv } from "..";
import { DatabaseTypeEnum } from "../Types/DatabaseType";

export default class SequelizeDatabase implements IDatabase
{

    private _database: Sequelize;
    private _highScores;

    constructor()
    {

        this._database = this.SetupDatabase();

        this._highScores = this._database.define('highscores',
        {
            id: { type: sequelize.STRING, unique: true, primaryKey: true },
            numberOfBurgers: { type: sequelize.INTEGER, defaultValue: 0 },
            numberOfTimesBurgered: { type: sequelize.INTEGER, defaultValue: 0 },
        });

        this._highScores.sync();
    }

    public async GetAllHighscores(): Promise<any>
    {
        this._highScores.sync();

        return await this._highScores.findAll();
    }

    public async SetHighscores(userId: string, incrementNumberOfTimesBurgered: boolean): Promise<void>
    {
        const userHighScore = await this.GetUserHighScore(userId);

        if (userHighScore)
        {
            userHighScore.increment(incrementNumberOfTimesBurgered ? 'numberOfTimesBurgered' : 'numberOfBurgers');
            return;
        }

        this._highScores.create(
            {
                id: userId
            });

    }

    private async GetUserHighScore(userId: string)
    {
        return await this._highScores.findOne( { where: { id: userId } } );
    }

    private SetupDatabase(){

        const logging = IsDevelopmentEnv ? console.log : false;

        var options = {
            host: DatabaseHost,
            dialect: DatabaseType,
            logging,
        } as sequelize.Options;

        if (DatabaseType === DatabaseTypeEnum.Sqlite)
        {
            options.storage = DatabaseHost;
            return new Sequelize('database', 'user', 'password', options);
        }

        const DbUser = process.env.DbUser;
        const DbPassword = process.env.DbPassword;

        if (DbUser === undefined || DbUser === null){
            throw new Error("Database Username not provided in env.")
        }

        return new Sequelize('burger-bot', DbUser, DbPassword, options);
    }

}
