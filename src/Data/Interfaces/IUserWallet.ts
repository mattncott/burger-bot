export default interface ICommand {
    IncreaseUserWallet(userId: string): Promise<void>;
    DecreaseUserWallet(userId: string, walletDecreaseBy: number): Promise<void>;
    Get(userId: string): Promise<any>;
}