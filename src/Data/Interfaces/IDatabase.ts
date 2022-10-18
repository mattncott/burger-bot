export default interface IDatabase {
    GetAllHighscores(): Promise<any>; // TODO replace with HighScoreType[]
    SetHighscores(userID: string, incrementNumberOfTimesBurgered: boolean): Promise<void>;
}