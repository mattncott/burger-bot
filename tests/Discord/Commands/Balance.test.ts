import IDatabase from "../../../src/Data/Interfaces/IDatabase";
import IUserWallet from "../../../src/Data/Interfaces/IUserWallet";
import Balance from "../../../src/Discord/Commands/Balance";
import { User as UserType } from "../../../src/Types/User";

import { mock } from 'jest-mock-extended';
import { ChatInputCommandInteraction, CommandInteractionOptionResolver, User } from "discord.js";
import { UserWalletType } from "../../../src/Types/UserWallet";



describe('Balance Command tests', () => {

  const mockDatabase = mock<IDatabase>();
  const mockUserWallet = mock<IUserWallet>();
  const mockInteraction = mock<ChatInputCommandInteraction>();
  const balanceClass = new Balance(mockInteraction, mockDatabase, mockUserWallet);

  const mockUser = mock<User>();

  beforeEach(() => {
    mockUser.id = "1";
    mockInteraction.user = mockUser;

    mockUserWallet.Get.mockReturnValue(Promise.resolve(
        { amountInWallet: 10 } as UserWalletType
    ));
  });

  test('Displays the correct balance to the user', async () => {
    await balanceClass.HandleCommand();
    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: `You have 10 crypto burger coins. Use /shop to see what you can buy`,
        ephemeral: true
    });
  });

  test('Calls the database for balance the correct number of times', async () => {
    await balanceClass.HandleCommand();
    expect(mockUserWallet.Get).toHaveBeenCalledTimes(1);
  });

});
