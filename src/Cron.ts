import cron from "node-cron";
import { Client, userMention } from "discord.js";
import { LogInfo } from "./Logger";
import BaseDiscord from "./Discord/BaseDiscord";
import IDatabase from "./Data/Interfaces/IDatabase";
import SequelizeDatabase from "./Data/SequelizeDatabase";
import { HighScoreType } from "./Types/HighScoreType";
import { Roles } from "./Types/Roles";
import { User } from "./Types/User";

export default class Cron extends BaseDiscord
{
    private readonly _database: IDatabase;

    constructor(discordBot: Client, database?: IDatabase)
    {
        super(discordBot);

        this._database = database === null || database === undefined ? new SequelizeDatabase() : database;
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
            LogInfo("Calculating who is most burgered today")
            
            const allGuildIds = await this._database.GetAllGuilds();

            for (let i = 0; allGuildIds.length - 1>= i; i++){
                const guild = this.GetDiscordGuild(allGuildIds[i].id);

                const mostBurgeredRole = await this.GetOrCreateRole(Roles.MostBurgered, {}, guild);
                const mostBurgeredUser = mostBurgeredRole.members.first();
                if (mostBurgeredUser !== undefined){
                    this.RemoveUserFromRole(guild, mostBurgeredRole, mostBurgeredUser.id);
                }

                const allHighscoresForGuild = await this._database.GetAllHighscores(guild.id);

                if (allHighscoresForGuild.length === 0) {
                    LogInfo(`No highscores for guild ${guild.id}`)
                    return;
                }
                const mostBurgered = allHighscoresForGuild.reduce((p: HighScoreType, c: HighScoreType) => p.numberOfTimesBurgered >= c.numberOfTimesBurgered ? p : c);
                this.AddUserToRole(guild, mostBurgeredRole, mostBurgered.id);

                const channel = await this.GetChannelToSendMessageTo(guild);

                LogInfo(channel?.id);
                if (channel !== undefined){
                    this.SendMessageToChannel(channel.id, `${userMention(mostBurgered.id)} was the most burgered today! They've been given the most burgered role!`);
                }
            }

            await this._database.ClearHighscores();
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