import { ChatInputCommandInteraction, Interaction } from "discord.js";
import sequelize, { Sequelize } from "sequelize";
import IDatabase from "./interfaces/IDatabase";

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

        const logging = process.env.NODE_ENV !== 'production' ? console.log : false;

        return new Sequelize('database', 'user', 'password', {
            host: process.env.databasehost,
            dialect: 'sqlite',
            logging,
            // SQLite only
            storage: 'database.sqlite',
        });
    }

}

