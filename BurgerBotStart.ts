import { StartBot } from "./Discord/Bot";
import { RegisterCommands } from "./Discord/CommandHandle";
import { isNull } from "./Discord/Helper";
import { ListenForImages } from "./Discord/ImageListener/ImageListener";
import { StartWebServer } from "./Discord/WebServer";

require(`dotenv`).config();

export const DiscordToken = process.env.token;
export const guildId = process.env.guildid;
export const clientId = process.env.clientid;
export const IsDevelopmentEnv = process.env.NODE_ENV !== 'production';

ValidateEnvironmentVariables();

Run();

async function Run(){
    StartBot();
    RegisterCommands();
    StartWebServer();
    ListenForImages();
}

function ValidateEnvironmentVariables() {
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