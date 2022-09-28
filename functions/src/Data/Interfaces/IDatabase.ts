import { HighScoreType } from "../../Types/HighScoreType";

export default interface IDatabase {
    GetAllHighscores(): HighScoreType[];
    SetHighscores(userID: string, incrementNumberOfTimesBurgered: boolean): Promise<void>;
}