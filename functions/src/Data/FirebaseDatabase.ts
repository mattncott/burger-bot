import IDatabase from "./Interfaces/IDatabase";
import * as admin from "firebase-admin";
import { Database } from "firebase-admin/lib/database/database";
import { LogError } from "../Logger";
import { HighScoreType } from "../Types/HighScoreType";
import { _topicWithOptions } from "firebase-functions/v1/pubsub";

export default class FirebaseDatabase implements IDatabase
{

    private _database: Database;
    private _databaseReference;

    private _highScores: HighScoreType[] = [];

    constructor()
    {
        this._database = this.SetupDatabase();
        this._databaseReference = this._database.ref("burger-bot/database");

        this.SetupListeners();
    }

    public GetAllHighscores(): HighScoreType[]
    {
        return this._highScores;
    }

    public async SetHighscores(userId: string, incrementNumberOfTimesBurgered: boolean): Promise<void>
    {
        const userHighScore = this.GetUserHighScore(userId);
        const userHighScoreReference = this._databaseReference.child('highscores').child(userId);

        if (userHighScore !== null) 
        {
            if (incrementNumberOfTimesBurgered)
            {
                userHighScoreReference.update({numberOfTimesBurgered: (userHighScore.numberOfTimesBurgered + 1)});
            }
            else 
            {
                userHighScoreReference.update({numberOfBurgers: (userHighScore.numberOfBurgers + 1)});
            }
        }
        else
        {
            const highscore = {
                id: userId,
                numberOfTimesBurgered: incrementNumberOfTimesBurgered ? 1 : 0,
                numberOfBurgers: !incrementNumberOfTimesBurgered ? 1 : 0,
            };
            userHighScoreReference.set(highscore);
            this._highScores.push(highscore);
        }
    }

    private GetUserHighScore(userId: string): HighScoreType | null
    {
        var highscore = this._highScores.find((highscore) => highscore.id === userId)
        return highscore === undefined ? null : highscore;
    }

    private SetupListeners(): void
    {
        this.SetupHighScoreListeners();
    }

    private SetupHighScoreListeners(): void 
    {
        const allUserHighScores = this._databaseReference.child('highscores');

        allUserHighScores.on('value', (snapshot) => {
            const highscores = snapshot.val();

            if (this._highScores === undefined || this._highScores === null) {
                this._highScores = [];
            }

            const keys = Object.keys(highscores);

            keys.forEach((key: string) => {
                this._highScores.push(highscores[key]);
            });
          }, (errorObject) => {
            LogError('The read failed: ' + errorObject.name);
          });
    }

    private SetupDatabase() : Database
    {
        // Fetch the service account key JSON file contents
        var serviceAccount = require("../../../../burger-bot-baca4-firebase-adminsdk-h2lk7-e188154002.json");

        // Initialize the app with a service account, granting admin privileges
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            // The database URL depends on the location of the database
            databaseURL: "https://burger-bot-baca4-default-rtdb.firebaseio.com"
        }, `BurgerBotDb-${Math.random()}`);

        // As an admin, the app has access to read and write all data, regardless of Security Rules
        return admin.database();
    }

}

