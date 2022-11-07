import { Client, CreateRoleOptions, Guild, Role } from "discord.js";

export default class BaseDiscord
{
    protected readonly _discordBot: Client;

    constructor(discordBot: Client)
    {
        this._discordBot = discordBot;
    }

    protected GetDiscordGuild(guildId: string): Guild
    {
        const guild = this._discordBot.guilds.cache.get(guildId);

        if (guild === undefined) {
            throw new Error("Cannot run cron, Server is undefined");
        }

        return guild;
    }

    protected async GetOrCreateRole(roleName: string, roleData: CreateRoleOptions, guild: string | Guild): Promise<Role>
    {
        if (typeof guild === 'string'){
            guild = this.GetDiscordGuild(guild);
        }


        let role = guild.roles.cache.find((role: Role) => role.name == roleName);

        if (role === undefined)
        {
            role = await guild.roles.create(roleData);
        }

        if (role === undefined)
        {
            throw new Error("Failed to create role");
        }

        return role;
    }
}