import { UserWallet } from "../../src/Data/UserWallet";
import IDatabase from "../../src/Data/Interfaces/IDatabase";
import { UserWalletType } from "../../src/Types/UserWallet";
import { mock } from 'jest-mock-extended';

describe('UserWallet tests', () => {

  const databaseMock = mock<IDatabase>();
  const userWallet = new UserWallet(databaseMock);

  test('Decreasing the user wallet by an amount greater than the users wallet fails', async () => {
    const userId = "1";
    databaseMock.GetUserWallet.mockReturnValue(Promise.resolve({
        id: "1",
        amountInWallet: 0,
        userId: userId,
    } as UserWalletType));

    await expect(userWallet.DecreaseUserWallet(userId, 10)).rejects.toThrow("Cannot Purchase, not enough money in wallet.");
  });

  test('Decreasing the user wallet when the user has enough money resolves', async () => {
    const userId = "1";
    databaseMock.GetUserWallet.mockReturnValue(Promise.resolve({
        id: "1",
        amountInWallet: 10,
        userId: userId,
    } as UserWalletType));

    await expect(userWallet.DecreaseUserWallet(userId, 10)).resolves;
  });

  test('Decreasing the user wallet when the user has enough calls database', async () => {
    const userId = "1";
    databaseMock.GetUserWallet.mockReturnValue(Promise.resolve({
        id: "1",
        amountInWallet: 10,
        userId: userId,
    } as UserWalletType));

    await userWallet.DecreaseUserWallet(userId, 10);

    expect(databaseMock.UpdateUserWallet).toHaveBeenCalledWith(userId, 0);
  });

  test('Increasing the user wallet when a user burgers with no enhancement calls database with right value', async () => {
    const userId = "1";
    databaseMock.GetUserWallet.mockReturnValue(Promise.resolve({
        id: "1",
        amountInWallet: 10,
        userId: userId,
    } as UserWalletType));

    await userWallet.IncreaseUserWallet(userId);

    expect(databaseMock.UpdateUserWallet).toHaveBeenCalledWith(userId, 11);
  });

  test('When user does not have enough money, returns false', async () => {
    const userId = "1";
    databaseMock.GetUserWallet.mockReturnValue(Promise.resolve({
        id: "1",
        amountInWallet: 5,
        userId: userId,
    } as UserWalletType));

    const result = await userWallet.CheckTheresEnoughMoneyInWallet(userId, 10);

    expect(result).toBeFalsy();
  });

  test('When user does have enough money, returns true', async () => {
    const userId = "1";
    databaseMock.GetUserWallet.mockReturnValue(Promise.resolve({
        id: "1",
        amountInWallet: 15,
        userId: userId,
    } as UserWalletType));

    const result = await userWallet.CheckTheresEnoughMoneyInWallet(userId, 10);

    expect(result).toBeTruthy();
  });

  test('When the user applies a bet that is over their allowed limit, returns false', async () => {
    const userId = "1";
    const result = await userWallet.WagerIsOverMaxUserBet(userId, 11);

    expect(result).toBeTruthy();
  });

  test('When the user applies a bet that is under their allowed limit, returns false', async () => {
    const userId = "1";
    const result = await userWallet.WagerIsOverMaxUserBet(userId, 1);

    expect(result).toBeFalsy();
  });


});
