import { StartBot } from "./Discord/Bot";
import { RegisterCommands } from "./Discord/CommandRegister";
import { isNull } from "./Helper";
import { DatabaseTypeEnum } from "./Types/DatabaseType";

require(`dotenv`).config();

export const EnvironmentMode = isNull(process.env.NODE_ENV) ? 'production' : process.env.NODE_ENV;
export const DiscordToken = getEnvironmentVar(process.env.token);
export const guildId = getEnvironmentVar(process.env.guildid);
export const clientId = getEnvironmentVar(process.env.clientid);
export const DatabaseHost = isNull(process.env.databasehost) ? 'database.sqlite' : getEnvironmentVar(process.env.databasehost);
export const DatabaseType = isNull(process.env.databasetype) ? 'sqlite' : getEnvironmentVar(process.env.databasetype);

export const IsDevelopmentEnv = EnvironmentMode !== 'production';

ValidateEnvironmentVariables();
Run();

async function Run(){
    SetupDevelopmentEnvironment();
    StartBot();
    RegisterCommands();
    // TODO Add image listener back
    // ListenForImages();
}

function SetupDevelopmentEnvironment(): void{
    console.log(`Starting bot in ${EnvironmentMode} mode`)
    if (IsDevelopmentEnv){
        process.on('warning', (warning) => {
            console.log(warning.stack);
        });
    }
}

function getEnvironmentVar(environmentVar: undefined | string): string {
    return environmentVar === undefined ? "" : environmentVar;
}

function ValidateEnvironmentVariables(): void {
    const allowedDatabaseTypes = [ DatabaseTypeEnum.Mysql, DatabaseTypeEnum.Sqlite ];

    if (isNull(DiscordToken)) {
        throw new Error("token is not defined");
    }
    
    if (isNull(guildId)) {
        throw new Error("guildid is not defined");
    }
    
    if (isNull(clientId)) {
        throw new Error("clientid is not defined");
    }

    if (!allowedDatabaseTypes.includes(DatabaseType as DatabaseTypeEnum)){
        throw new Error("Non supported database type");
    }
}
