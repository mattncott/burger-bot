import SequelizeDatabase from "./Data/SequelizeDatabase";
import { StartBot } from "./Discord/Bot";
import { RegisterCommands } from "./Discord/CommandRegister";
import { EnvironmentMode, IsDevelopmentEnv, DiscordToken, guildId, clientId, DatabaseType } from "./Environment";
import { isNull } from "./Helper";
import { DatabaseTypeEnum } from "./Types/DatabaseType";
import { ShopItems } from "./Types/ShopItems";

ValidateEnvironmentVariables();
Run();

async function Run(){
    SetupDevelopmentEnvironment();
    await ValidateDatabase();
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

async function ValidateDatabase() {
    const database = new SequelizeDatabase();
    await database.ValidateDatabase();
    console.log('Database validated');

    // Setup the shop
    try {
        await database.CreateShopItem(ShopItems.Shield, "Shield", 10);

        console.log('Shop is setup')
    } catch (error) {
        console.error(error)
    }
}