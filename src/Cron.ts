import cron from "node-cron";
import { Client, Guild,  TextChannel } from "discord.js";
import { LogError } from "./Logger";
import BaseDiscord from "./Discord/BaseDiscord";

export default class Cron extends BaseDiscord
{
    private _guild: Guild | undefined = undefined;
    // private readonly _database: IDatabase;


    constructor(discordBot: Client)
    {
        super(discordBot)
    }

    public Run() 
    {
        console.log('Starting Cron...');
        this.RunFuncEveryMinute(async () => {
            LogError("Calculating who is most burgered today")
            
            this._guild = this.GetDiscordGuild("");

            const burgeredRole = await this.GetOrCreateRole("Burgered", {}, this._guild);

            const mostBurgeredRole = await this.GetOrCreateRole("Most Burgered", {}, this._guild);

            console.log(burgeredRole.id);
            console.log(mostBurgeredRole.id);

            const channel = this._discordBot.channels.cache.get("1011353740999151758") as TextChannel;

            const send = false;
            if (send){
                channel?.send('content');
            }
        });
    }

    private RunFuncEveryMinute(func: () => void): void
    {
        cron.schedule('* * * * *', func);
    }

    // private RunFuncEveryDayAtTenPm(func: () => void): void
    // {
    //     cron.schedule('* * 22 * *', func);
    // }

}