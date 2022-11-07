import { GuildId } from "../Environment";
import IDatabase from "./Interfaces/IDatabase";

export default async function UpgradeDatabaseData(database: IDatabase)
{
    await script_071120221626(database);   
}

async function script_071120221626(database: IDatabase){
    // Only one server exists at time of creating this script
    const allUserHighScores = await database.GetAllHighscores(GuildId);

    for (let i = 0; allUserHighScores.length-1 >= i; i++)
    {
        if (allUserHighScores[i].userId === null)
        {
            await database.UpdateHighScoreUserId(allUserHighScores[i].id, allUserHighScores[i].id);
        }

    }

    const allGuids = await database.GetAllGuilds();
    if (allGuids.length === 0)
    {
        await database.AddGuild("544533251742629918");
    }
}