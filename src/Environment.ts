import { isNull } from "./Helper";
require(`dotenv`).config();

export const EnvironmentMode = isNull(process.env.NODE_ENV) ? 'production' : process.env.NODE_ENV;
export const DiscordToken = getEnvironmentVar(process.env.token);
export const guildId = getEnvironmentVar(process.env.guildid);
export const clientId = getEnvironmentVar(process.env.clientid);
export const DatabaseHost = isNull(process.env.databasehost) ? 'database.sqlite' : getEnvironmentVar(process.env.databasehost);
export const DatabaseType = isNull(process.env.databasetype) ? 'sqlite' : getEnvironmentVar(process.env.databasetype);

export const IsDevelopmentEnv = EnvironmentMode !== 'production';

function getEnvironmentVar(environmentVar: undefined | string): string {
    return environmentVar === undefined ? "" : environmentVar;
}