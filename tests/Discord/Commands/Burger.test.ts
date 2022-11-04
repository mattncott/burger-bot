import IDatabase from "../../../src/Data/Interfaces/IDatabase";
import IUserWallet from "../../../src/Data/Interfaces/IUserWallet";
import Burger from "../../../src/Discord/Commands/Burger";
import { User as UserType } from "../../../src/Types/User";

import { mock } from 'jest-mock-extended';
import { ChatInputCommandInteraction, CommandInteractionOptionResolver, User } from "discord.js";



describe('Burger Command tests', () => {

  let mockDatabase = mock<IDatabase>();
  let mockUserWallet = mock<IUserWallet>();
  let mockInteraction = mock<ChatInputCommandInteraction>();
  let burgerClass = new Burger(mockInteraction, mockDatabase, mockUserWallet);

  const mockUser = mock<User>();

  beforeEach(() => {
    mockUser.id = "1";
    mockInteraction.user = mockUser;

    mockDatabase.GetUserShieldStatus.mockReturnValue(Promise.resolve(false));
    mockDatabase.GetUserShieldPenetratorStatus.mockReturnValue(Promise.resolve(false));
    burgerClass = new Burger(mockInteraction, mockDatabase, mockUserWallet);
  });

  test('Burger when on cooldown does not update database', async () => {
    const coolDownDate = new Date();
    coolDownDate.setMinutes(coolDownDate.getMinutes() + 10);

    mockDatabase.GetUser.mockReturnValue(Promise.resolve({
      coolDown: coolDownDate
    } as UserType));

    const handleGetTargetUser = jest.spyOn(Burger.prototype as any, 'GetTargetUser');
    handleGetTargetUser.mockImplementation(() => mock<User>());

    await burgerClass.HandleCommand();
    expect(mockDatabase.SetHighscores).toHaveBeenCalledTimes(0);
  });

  test('Burger when on cooldown returns cooldown message', async () => {
    const coolDownDate = new Date();
    coolDownDate.setMinutes(coolDownDate.getMinutes() + 10);

    mockDatabase.GetUser.mockReturnValue(Promise.resolve({
      coolDown: coolDownDate
    } as UserType));

    const handleGetTargetUser = jest.spyOn(Burger.prototype as any, 'GetTargetUser');
    handleGetTargetUser.mockImplementation(() => mock<User>());

    await burgerClass.HandleCommand();
    expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: `You can't send a Burger right now. You're on a cooldown for 10 minutes`,
        ephemeral: true
    });
  });

  test('Burger when user has a shield, displays correct message to channel', async () => {
    mockDatabase.GetUser.mockReturnValue(Promise.resolve({} as UserType));

    const handleGetTargetUser = jest.spyOn(Burger.prototype as any, 'GetTargetUser');
    handleGetTargetUser.mockImplementation(() => {
      const user = mock<User>();
      user.id = "2";
      return user;
    });

    mockDatabase.GetUserShieldStatus.mockReturnValue(Promise.resolve(true));

    await burgerClass.HandleCommand();

    expect(mockInteraction.reply).toHaveBeenCalled();
    expect(mockInteraction.reply).toHaveBeenCalledWith(`Ouch! <@2> had a shield! You just burgered YOURSELF <@1>`);
  });

  test('Burger when user has a shield, calls database correctly', async () => {
    mockDatabase.GetUser.mockReturnValue(Promise.resolve({} as UserType));

    const handleGetTargetUser = jest.spyOn(Burger.prototype as any, 'GetTargetUser');
    handleGetTargetUser.mockImplementation(() => {
      const user = mock<User>();
      user.id = "2";
      return user;
    });

    mockDatabase.GetUserShieldStatus.mockReturnValue(Promise.resolve(true));

    await burgerClass.HandleCommand();

    expect(mockDatabase.SetHighscores).toHaveBeenCalledTimes(1);
    expect(mockDatabase.SetUserShield).toHaveBeenCalledTimes(1);
    expect(mockDatabase.SetUserShieldPenetratorStatus).toHaveBeenCalledTimes(0);
    expect(mockDatabase.SetUserCooldown).toHaveBeenCalledTimes(1);
  });

  test('Burger no target user, burgers yourself', async () => {
    mockDatabase.GetUser.mockReturnValue(Promise.resolve({} as UserType));

    const handleGetTargetUser = jest.spyOn(Burger.prototype as any, 'GetTargetUser');
    handleGetTargetUser.mockImplementation(() => null);

    await burgerClass.HandleCommand();

    expect(mockInteraction.reply).toHaveBeenCalledWith(`<@1> just burgered <@1>`);
  });

  test('Burger successfully calls the database correctly', async () => {
    mockDatabase.GetUser.mockReturnValue(Promise.resolve({} as UserType));

    const handleGetTargetUser = jest.spyOn(Burger.prototype as any, 'GetTargetUser');
    handleGetTargetUser.mockImplementation(() => null);

    await burgerClass.HandleCommand();

    expect(mockDatabase.SetHighscores).toHaveBeenCalledTimes(2);
    expect(mockDatabase.SetUserCooldown).toHaveBeenCalledTimes(1);
    expect(mockUserWallet.IncreaseUserWallet).toHaveBeenCalledTimes(1);
  });

  test('Burger successfully displays the correct message to the channel', async () => {
    mockDatabase.GetUser.mockReturnValue(Promise.resolve({} as UserType));
    

    const handleGetTargetUser = jest.spyOn(Burger.prototype as any, 'GetTargetUser');
    handleGetTargetUser.mockImplementation(() => {
      const user = mock<User>();
      user.id = "2";
      return user;
    });

    await burgerClass.HandleCommand();

    expect(mockInteraction.reply).toHaveBeenCalledWith(`<@1> just burgered <@2>`);
  });

  test('User has shield penetrator but target does not have a shield', async () => {
    mockDatabase.GetUser.mockReturnValue(Promise.resolve({} as UserType));
    
    const handleGetTargetUser = jest.spyOn(Burger.prototype as any, 'GetTargetUser');
    handleGetTargetUser.mockImplementation(() => {
      const user = mock<User>();
      user.id = "2";
      return user;
    });

    mockDatabase.GetUserShieldPenetratorStatus.mockReturnValue(Promise.resolve(true));

    await burgerClass.HandleCommand();

    expect(mockDatabase.SetHighscores).toHaveBeenCalledTimes(2);
    expect(mockDatabase.SetUserShieldPenetratorStatus).toHaveBeenCalledTimes(1);
    expect(mockDatabase.SetUserCooldown).toHaveBeenCalledTimes(1);
    expect(mockUserWallet.IncreaseUserWallet).toHaveBeenCalledTimes(1);

    expect(mockInteraction.reply).toHaveBeenCalledWith(`Rippage <@1> wasted their shield penetrator and just burgered <@2>, they did not have a shield`);
  });

  test('User has shield penetrator and target does have a shield', async () => {
    mockDatabase.GetUser.mockReturnValue(Promise.resolve({} as UserType));

    mockDatabase.GetUserShieldPenetratorStatus.mockReturnValue(Promise.resolve(true));
    mockDatabase.GetUserShieldStatus.mockReturnValue(Promise.resolve(true));
    
    const handleGetTargetUser = jest.spyOn(Burger.prototype as any, 'GetTargetUser');
    handleGetTargetUser.mockImplementation(() => {
      const user = mock<User>();
      user.id = "2";
      return user;
    });

    await burgerClass.HandleCommand();

    expect(mockInteraction.reply).toHaveBeenCalledWith(`<@1> used their shield penetrator and just burgered <@2>`);
  });

});
