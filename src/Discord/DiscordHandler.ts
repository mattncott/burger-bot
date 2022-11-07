import { Client, Guild } from "discord.js";
import BaseDiscord from "./BaseDiscord";

export default class DiscordHandler extends BaseDiscord
{

    constructor(discordBot: Client)
    {
        super(discordBot);
    }

    public async SetupDiscordServer(guild: string | Guild)
    {
        await this.GetOrCreateRole("Burgered", {
            name: "Burgered",
            color: "Yellow",
            reason: "A role for who is currently burgered"
        }, guild);

        await this.GetOrCreateRole("Most Burgered", {
            name: "Most Burgered",
            color: "DarkGold",
            reason: "A role for who is currently the most burgered"
        }, guild);
    }
}