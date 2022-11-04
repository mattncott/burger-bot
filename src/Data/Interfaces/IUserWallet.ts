export default interface ICommand {
    IncreaseUserWallet(userId: string): Promise<void>;
    DecreaseUserWallet(userId: string, walletDecreaseBy: number): Promise<void>;
    Get(userId: string): Promise<any>;
    IncreaseUserWalletByAmount(userId: string, increaseByAmount: number): Promise<void>;
    CheckTheresEnoughMoneyInWallet(userId: string, amountToCheck: number): Promise<boolean>;
}