import { Sequelize } from "sequelize";
import * as sequelize from "sequelize";
import IDatabase from "./Interfaces/IDatabase";
import { DatabaseHost, DatabaseType, IsDevelopmentEnv } from "..";
import { DatabaseTypeEnum } from "../Types/DatabaseType";
import { User } from "../Types/User";

export default class SequelizeDatabase implements IDatabase
{

    private _database: Sequelize;
    private _highScores;
    private _wallets;
    private _users;
    private _shopItems;

    constructor()
    {

        this._database = this.SetupDatabase();

        this._highScores = this._database.define('highscores',
        {
            id: { type: sequelize.STRING, unique: true, primaryKey: true },
            numberOfBurgers: { type: sequelize.INTEGER, defaultValue: 0 },
            numberOfTimesBurgered: { type: sequelize.INTEGER, defaultValue: 0 },
        });

        this._wallets = this._database.define('wallets',
        {
            id: { type: sequelize.STRING, unique: true, primaryKey: true },
            amountInWallet: { type: sequelize.INTEGER, defaultValue: 15 }
        });

        this._users = this._database.define('users', 
        {
            id: { type: sequelize.STRING, unique: true, primaryKey: true },
            coolDown: { type: sequelize.DATE },
            hasShield: { type: sequelize.BOOLEAN, defaultValue: false },
        });

        this._shopItems = this._database.define('shopItems', {
            id: { type: sequelize.INTEGER, unique: true, primaryKey: true },
            name: { type: sequelize.STRING, allowNull: false },
            price: { type: sequelize.INTEGER, allowNull: false }
        })
    }

    public async GetAllHighscores(): Promise<any>
    {
        await this._highScores.sync({ alter: true });
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

    public async CreateUser(userId: string): Promise<void> {
        await this._users.create( { id: userId } );
        await this.CreateUserWallet(userId);
    }

    public async GetUser(userId: string): Promise<any> {
        return await this._users.findOne( { where: { id: userId } } );
    }

    public async SetUserCooldown(userId: string): Promise<void> {
        const date = new Date();
        date.setMinutes(date.getMinutes() + 10);

        this._users.update( { coolDown: date }, { where: { id: userId } });
    }

    public async GetUserCooldown(userId: string): Promise<Date> {
        const user = await this.GetUser(userId) as User;

        if (user === null){
            throw new Error('No user exists');
        }

        return user.coolDown;
    }

    public async UpdateUserWallet(userId: string, newAmount: number): Promise<void> {
        this._wallets.update({ amountInWallet: newAmount }, { where: { id: userId } });
    }

    public async GetUserWallet(userId: string): Promise<any> {
        if (userId === undefined || userId === null){
            return;
        }

        return await this._wallets.findOne( { where: { id: userId } } );
    }

    private async CreateUserWallet(userId: string): Promise<void>{
        if (userId === undefined || userId === null){
            return;
        }

        await this._wallets.create( { id: userId } );
    }

    public async SetUserShield(userId: string, hasShield: boolean): Promise<void> {
        await this._users.update( { hasShield }, {where: { id: userId }});
    }

    public async GetUserShieldStatus(userId: string): Promise<boolean> {
        const user = await this.GetUser(userId);
        return user?.hasShield;
    }

    public async ValidateDatabase(){
        await this._highScores.sync({ alter: true });
        await this._users.sync({ alter: true });
        await this._wallets.sync({ alter: true });
        await this._shopItems.sync({ alter: true });
    }

    public async GetAllShopItems(): Promise<any> {
        return this._shopItems.findAll();
    }

    public async CreateShopItem(id: number, name: string, price: number): Promise<void>{
        const shopItemExists = this._shopItems.findByPk(id);

        if (!shopItemExists){
            await this._shopItems.create({ id, name, price });
        }
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
