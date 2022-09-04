import sequelize from "sequelize";

export default interface IDatabase {
    GetAllHighscores(): Promise<sequelize.Model<any, any>[]>;
    SetHighscores(userID: string, incrementNumberOfTimesBurgered: boolean): Promise<void>;
}