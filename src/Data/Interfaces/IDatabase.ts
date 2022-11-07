export default interface IDatabase {
    ValidateDatabase(): Promise<void>;
    GetAllHighscores(guildId: string): Promise<any>; // TODO replace with HighScoreType[]
    SetHighscores(userID: string, incrementNumberOfTimesBurgered: boolean, guildId: string): Promise<void>;
    GetUserWallet(userId: string): Promise<any>; // TODO replace with UserWallet
    SetUserCooldown(userId: string): Promise<void>;
    GetUserCooldown(userId: string): Promise<Date>;
    GetUser(userId: string): Promise<any>;
    CreateUser(userId: string): Promise<void>;
    SetUserShield(userId: string, hasShield: boolean): Promise<void>;
    UpdateUserWallet(userId: string, newAmount: number): Promise<void>;
    GetUserShieldStatus(userId: string): Promise<boolean>;
    CreateShopItem(id: number, name: string, price: number, description: string): Promise<void>;
    GetAllShopItems(): Promise<any>;
    GetUserShieldPenetratorStatus(userId: string): Promise<boolean>;
    SetUserShieldPenetratorStatus(userId: string, shieldPenetratorEnabled: boolean): Promise<void>;
    GetAllGuilds(): Promise<any>;
    AddGuild(guildId: string): Promise<void>;
    SetBurgered(userId: string, isBurgered: boolean): Promise<void>;
    ClearHighscores(): Promise<void>;
    UpdateHighScoreUserId(userId: string, id: string): Promise<void>;
}