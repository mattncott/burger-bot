import { Sequelize } from "sequelize";
import * as sequelize from "sequelize";
import IDatabase from "./Interfaces/IDatabase";
import { DatabaseHost, DatabaseType, GuildId, IsDevelopmentEnv } from "../Environment";
import { DatabaseTypeEnum } from "../Types/DatabaseType";
import { User } from "../Types/User";

export default class SequelizeDatabase implements IDatabase
{

    private _database: Sequelize;
    private _highScores;
    private _wallets;
    private _users;
    private _shopItems;
    private _guilds;

    constructor()
    {

        this._database = this.SetupDatabase();

        this._highScores = this._database.define('highscores',
        {
            id: { type: sequelize.BIGINT, unique: true, primaryKey: true },
            userId: { type: sequelize.STRING },
            numberOfBurgers: { type: sequelize.INTEGER, defaultValue: 0 },
            numberOfTimesBurgered: { type: sequelize.INTEGER, defaultValue: 0 },
            guildId: { type: sequelize.STRING, allowNull: false, defaultValue: GuildId },
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
            hasShieldPenetrator: { type: sequelize.BOOLEAN, defaultValue: false },
            burgeredStatus: { type: sequelize.DATE },
        });

        this._shopItems = this._database.define('shopItems', {
            id: { type: sequelize.INTEGER, unique: true, primaryKey: true },
            name: { type: sequelize.STRING, allowNull: false },
            price: { type: sequelize.INTEGER, allowNull: false },
            description: { type: sequelize.STRING, allowNull: true }
        })

        this._guilds = this._database.define('guilds', {
            id: { type: sequelize.STRING, unique: true, primaryKey: true },
        })
    }

    public async GetAllHighscores(guildId: string): Promise<any>
    {
        await this._highScores.sync({ alter: true });
        return await this._highScores.findAll({ where: { guildId } });
    }

    public async SetHighscores(userId: string, incrementNumberOfTimesBurgered: boolean, guildId: string): Promise<void>
    {
        const userHighScore = await this.GetUserHighScore(userId, guildId);

        if (userHighScore)
        {
            userHighScore.increment(incrementNumberOfTimesBurgered ? 'numberOfTimesBurgered' : 'numberOfBurgers');
            return;
        }

        this._highScores.create(
            {
                userId,
                guildId
            });

    }

    public async CreateUser(userId: string): Promise<void> {
        await this._users.create( { id: userId } );
        await this.CreateUserWallet(userId);
    }

    public async GetUser(userId: string): Promise<any> {
        const user = await this.FindUser(userId);

        if (!user) {
            await this.CreateUser(userId);
        }

        return await this.FindUser(userId);
    }

    public async SetUserCooldown(userId: string): Promise<void> {
        const date = new Date();

        if (!IsDevelopmentEnv) {
            date.setMinutes(date.getMinutes() + 10);

            this._users.update( { coolDown: date }, { where: { id: userId } });
        }
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
        await this._shopItems.sync({ force: true });
        await this._guilds.sync({ alter: true });
    }

    public async GetAllShopItems(): Promise<any> {
        return this._shopItems.findAll();
    }

    public async CreateShopItem(id: number, name: string, price: number, description: string): Promise<void>{
        const shopItemExists = await this._shopItems.findByPk(id);

        if (!shopItemExists){
            await this._shopItems.create({ id, name, price, description });
        }
    }

    public async GetUserShieldPenetratorStatus(userId: string): Promise<boolean>
    {
        const user = await this.GetUser(userId);
        return user?.hasShieldPenetrator;
    }

    public async SetUserShieldPenetratorStatus(userId: string, hasShieldPenetrator: boolean): Promise<void>{
        await this._users.update( { hasShieldPenetrator }, {where: { id: userId }});
    }

    public async GetAllGuilds(): Promise<any> {
        return await this._guilds.findAll();
    }

    public async AddGuild(guildId: string): Promise<void> {
        const guildExists = await this._guilds.findByPk(guildId);

        if (!guildExists){
            await this._guilds.create({
                id: guildId
            });
        }
    }

    public async SetBurgered(userId: string, isBurgered: boolean): Promise<void>
    {
        if (isBurgered)
        {
            const date = new Date();
            date.setMinutes(date.getMinutes() + 10);
            this._users.update( { burgeredStatus: date }, { where: { id: userId } });
        }
        else
        {
            this._users.update( { burgeredStatus: null }, { where: { id: userId } });
        }
    }

    public async ClearHighscores(): Promise<void>
    {
        await this._highScores.drop();
    }

    public async UpdateHighScoreUserId(userId: string, id: string): Promise<void>
    {
        await this._highScores.update( { userId }, { where: { id } } );
    }

    private async FindUser(userId: string) : Promise<any>
    {
        return await this._users.findOne( { where: { id: userId } } );
    }

    private async GetUserHighScore(userId: string, guildId: string)
    {
        return await this._highScores.findOne( { where: { userId, guildId } } );
    }

    private SetupDatabase(){

        var options = {
            host: DatabaseHost,
            dialect: DatabaseType,
            logging: false,
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
