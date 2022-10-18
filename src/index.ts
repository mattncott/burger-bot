import { StartBot } from "./Discord/Bot";
import { RegisterCommands } from "./Discord/CommandRegister";
import { isNull } from "./Helper";

require(`dotenv`).config();

export const DiscordToken = getEnvironmentVar(process.env.token);
export const guildId = getEnvironmentVar(process.env.guildid);
export const clientId = getEnvironmentVar(process.env.clientid);
export const IsDevelopmentEnv = process.env.NODE_ENV !== 'production';

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
    if (isNull(DiscordToken)) {
        throw new Error("token is not defined");
    }
    
    if (isNull(guildId)) {
        throw new Error("guildid is not defined");
    }
    
    if (isNull(clientId)) {
        throw new Error("clientid is not defined");
    }
}
