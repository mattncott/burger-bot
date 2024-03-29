import SequelizeDatabase from "./Data/SequelizeDatabase";
import UpgradeDatabaseData from "./Data/UpgradeScripts";
import DiscordBot from "./Discord/Bot";
import { EnvironmentMode, IsDevelopmentEnv, DiscordToken, ClientId, DatabaseType } from "./Environment";
import { isNull } from "./Helper";
import { LogError, StartUpLog } from "./Logger";
import { DatabaseTypeEnum } from "./Types/DatabaseType";
import { ShopItems } from "./Types/ShopItems";

ValidateEnvironmentVariables();
Run();
async function Run(){
    SetupDevelopmentEnvironment();
    await ValidateDatabase();
    StartDiscordBot();
}

function SetupDevelopmentEnvironment(): void{
    StartUpLog(`Starting bot in ${EnvironmentMode} mode`)
    if (IsDevelopmentEnv){
        process.on('warning', (warning) => {
            LogError(warning.stack);
        });
    }
}

function ValidateEnvironmentVariables(): void {
    const allowedDatabaseTypes = [ DatabaseTypeEnum.Mysql, DatabaseTypeEnum.Sqlite ];

    if (isNull(DiscordToken)) {
        throw new Error("token is not defined");
    }
    
    if (isNull(ClientId)) {
        throw new Error("clientid is not defined");
    }

    if (!allowedDatabaseTypes.includes(DatabaseType as DatabaseTypeEnum)){
        throw new Error("Non supported database type");
    }
}

function StartDiscordBot() {
    (async () => {
        const discordBot = new DiscordBot();
        await discordBot.RegisterCommands();
        await discordBot.Start();
    })();
}

async function ValidateDatabase() {
    const database = new SequelizeDatabase();
    await database.ValidateDatabase();
    await UpgradeDatabaseData(database);
    StartUpLog('Database validated');

    // Setup the shop
    try {
        await database.CreateShopItem(ShopItems.Shield, "Shield", 10, "Protect yourself from one burgering");
        await database.CreateShopItem(ShopItems.ShieldPenetrator, "Shield Penetrator", 10, "One time use, ignores a players shield status. Note: If you own a shield, you can't buy this");

        StartUpLog('Shop is setup')
    } catch (error) {
        LogError(error)
    }
}