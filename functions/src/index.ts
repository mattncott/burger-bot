import * as functions from "firebase-functions";
import { StartBot } from "./Discord/Bot";
import { RegisterCommands } from "./Discord/CommandRegister";
import { isNull } from "./Helper";
import * as admin from "firebase-admin";
import { LogInfo } from "./Logger";

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
    SetupFirebase();
    // StartWebServer();
    // ListenForImages();
}

export const helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", {structuredData: true});
    response.send("Hello from Firebase!");
});

function SetupFirebase(){
    // Fetch the service account key JSON file contents
    var serviceAccount = require("../../../burger-bot-baca4-firebase-adminsdk-h2lk7-e188154002.json");

    // Initialize the app with a service account, granting admin privileges
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // The database URL depends on the location of the database
        databaseURL: "https://burger-bot-baca4-default-rtdb.firebaseio.com"
    });

    LogInfo('Firebase Setup');
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
