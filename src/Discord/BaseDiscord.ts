import { Client, CreateRoleOptions, Guild, NonThreadGuildBasedChannel, Role, TextChannel } from "discord.js";
import { IsDevelopmentEnv } from "../Environment";
import { LogError } from "../Logger";

export default class BaseDiscord
{
    protected readonly _discordBot: Client;

    constructor(discordBot: Client)
    {
        this._discordBot = discordBot;
    }

    protected async AddUserToRole(guild: Guild, role: Role, userId: string): Promise<void>
    {
        try {
            const user = guild.members.cache.find(user => user.id === userId);
            user?.roles.add(role);
        } catch (err) {
            LogError(err);
        }
    }

    protected async RemoveUserFromRole(guild: Guild, role: Role, userId: string): Promise<void>
    {
        try {
            const user = guild.members.cache.find(user => user.id === userId);
            user?.roles.remove(role);
        } catch (err) {
            LogError(err);
        }
    }

    protected async GetChannelToSendMessageTo(guild: Guild): Promise<NonThreadGuildBasedChannel | undefined>
    {
        const channelAllowedToMessage = ["bot-commands", "to-git-pull"];

        if (IsDevelopmentEnv) {
            channelAllowedToMessage.push("general");
        }

        const channels = await guild.channels.fetch();

        let foundChannel = false;
        let channel = undefined;

        channelAllowedToMessage.forEach((chan) => {
            if (!foundChannel){
                channel = channels.find(ch => ch.name.includes(chan))

                if (channel !== undefined) {
                    foundChannel = true;
                }
            }
        });

        return channel;
    }

    protected SendMessageToChannel(channelId: string, message: string): void
    {
        const channel = this._discordBot.channels.cache.get(channelId) as TextChannel;
        channel?.send(message);
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