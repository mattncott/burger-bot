import cron from "node-cron";
import { ChatInputCommandInteraction, Client } from "discord.js";
import { LogInfo } from "./Logger";
import BaseDiscord from "./Discord/BaseDiscord";
import IDatabase from "./Data/Interfaces/IDatabase";
import SequelizeDatabase from "./Data/SequelizeDatabase";
import { Roles } from "./Types/Roles";
import { User } from "./Types/User";
import HighScore from "./Discord/Commands/Highscore";

export default class Cron extends BaseDiscord
{
    private readonly _database: IDatabase;
    private readonly _highscoreClass: HighScore;

    constructor(discordBot: Client, database?: IDatabase)
    {
        super(discordBot);

        this._database = database === null || database === undefined ? new SequelizeDatabase() : database;
        this._highscoreClass = new HighScore({} as ChatInputCommandInteraction, discordBot, database);
    }

    public Run() 
    {
        this.RunFuncEveryMinute(async () => {
            LogInfo("Recalculating who is currently burgered")
            
            const allGuildIds = await this._database.GetAllGuilds();

            allGuildIds.forEach(async (g: any) => {
                const guild = this.GetDiscordGuild(g.id);

                const burgeredRole = await this.GetOrCreateRole(Roles.Burgered, {}, guild);
                const burgeredUsers = burgeredRole.members;
                const now = new Date();

                burgeredUsers.forEach(async (user) => {
                    const userFromDatabase: User = await this._database.GetUser(user.id);

                    if (userFromDatabase.burgeredStatus !== null)
                    {
                        if (userFromDatabase.burgeredStatus < now)
                        {
                            this.RemoveUserFromRole(guild, burgeredRole, userFromDatabase.id);
                            await this._database.SetBurgered(userFromDatabase.id, false);
                        }
                    }
                });
            });
        });

        this.RunFuncEveryDayAtTenPm(async () => {
            await this._highscoreClass.CalculateMostBurgeredToday();
        });
    }

    private RunFuncEveryMinute(func: () => void): void
    {
        cron.schedule('* * * * *', func);
    }

    private RunFuncEveryDayAtTenPm(func: () => void): void
    {
        cron.schedule('* 22 * * *', func, {
            scheduled: true,
            timezone: "Europe/London"
        });
    }

}