import IDatabase from "../../../src/Data/Interfaces/IDatabase";
import IUserWallet from "../../../src/Data/Interfaces/IUserWallet";
import Gamble from "../../../src/Discord/Commands/Gamble";
import { HighScoreType } from "../../../src/Types/HighScoreType";

import { mock } from 'jest-mock-extended';
import { ChatInputCommandInteraction, Client, CommandInteractionOptionResolver, Role, User } from "discord.js";
import BaseDiscordCommand from "../../../src/Discord/Commands/BaseDiscordCommand";

describe('Burger Command tests', () => {

  let mockDatabase = mock<IDatabase>();
  let mockUserWallet = mock<IUserWallet>();
  let mockInteraction = mock<ChatInputCommandInteraction>();
  let mockDiscordClient = mock<Client>();

  let gambleClass = new Gamble(mockInteraction, mockDiscordClient, mockDatabase, mockUserWallet);

  const mockUser = mock<User>();

  beforeEach(() => {
    mockUser.id = "1";
    mockInteraction.user = mockUser;

    const userHighscores: HighScoreType[] = [
      { id: "1", numberOfBurgers: 0, numberOfTimesBurgered: 0},
      { id: "2", numberOfBurgers: 0, numberOfTimesBurgered: 0},
    ];

    mockUserWallet.CheckTheresEnoughMoneyInWallet.mockReturnValue(Promise.resolve(true));
    mockDatabase.GetAllHighscores.mockReturnValue(Promise.resolve(userHighscores));
    gambleClass = new Gamble(mockInteraction, mockDiscordClient, mockDatabase, mockUserWallet);

    const handleGetOrCreateRole = jest.spyOn(BaseDiscordCommand.prototype as any, 'GetOrCreateRole');
    handleGetOrCreateRole.mockImplementation(() => mock<Role>());

    const handleAddUserToRole = jest.spyOn(BaseDiscordCommand.prototype as any, 'AddUserToRole');
    handleAddUserToRole.mockImplementation(() => null);

    const handleGetTargetWager = jest.spyOn(Gamble.prototype as any, 'GetTargetWager');
    handleGetTargetWager.mockImplementation(() => 10);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Blank guild id throws the correct error', async () => {
    jest.spyOn(Gamble.prototype as any, 'GetGuildId').mockImplementation(() => null);

    await gambleClass.HandleCommand();
    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledWith("This command is only allowed from within a server.");
  });

  test('When someone plays roulette and hits themself, the correct reply appears', async () => {

    const handleGetWhoToLandOnRandomOrYourself = jest.spyOn(Gamble.prototype as any, 'GetWhoToLandOnRandomOrYourself');
    handleGetWhoToLandOnRandomOrYourself.mockImplementation(() => false);

    await gambleClass.HandleCommand();
    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledWith(`<@1> played roulette and just burgered themselves and lost 10 bc`);
  });

  test('When someone plays roulette and hits someone else, the correct reply appears', async () => {

    const handleGetWhoToLandOnRandomOrYourself = jest.spyOn(Gamble.prototype as any, 'GetWhoToLandOnRandomOrYourself');
    handleGetWhoToLandOnRandomOrYourself.mockImplementation(() => true);

    await gambleClass.HandleCommand();
    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledWith(`<@1> played roulette and just burgered <@2> and won 10 bc`);
  });

  test('When someone plays roulette and not enough players have been stored, correct reply appears', async () => {

    const handleGetWhoToLandOnRandomOrYourself = jest.spyOn(Gamble.prototype as any, 'GetWhoToLandOnRandomOrYourself');
    handleGetWhoToLandOnRandomOrYourself.mockImplementation(() => true);

    const userHighscores: HighScoreType[] = [
      { id: "1", numberOfBurgers: 0, numberOfTimesBurgered: 0},
    ];
    mockDatabase.GetAllHighscores.mockReturnValue(Promise.resolve(userHighscores));

    await gambleClass.HandleCommand();
    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledWith(`Not enough users have interacted with the burger bot to play roulette yet.`);
  });

  test('When someone plays and wagers a value less than 0, correct reply appears', async () => {

    const handleGetWhoToLandOnRandomOrYourself = jest.spyOn(Gamble.prototype as any, 'GetWhoToLandOnRandomOrYourself');
    handleGetWhoToLandOnRandomOrYourself.mockImplementation(() => true);

    const handleGetTargetWager = jest.spyOn(Gamble.prototype as any, 'GetTargetWager');
    handleGetTargetWager.mockImplementation(() => 0);

    await gambleClass.HandleCommand();
    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: `You must wager more than 0 bc to play this game`,
        ephemeral: true,
    });
  });

  test('When someone plays and wagers more money than they have, correct reply appears', async () => {

    const handleGetWhoToLandOnRandomOrYourself = jest.spyOn(Gamble.prototype as any, 'GetWhoToLandOnRandomOrYourself');
    handleGetWhoToLandOnRandomOrYourself.mockImplementation(() => true);

    mockUserWallet.CheckTheresEnoughMoneyInWallet.mockReturnValue(Promise.resolve(false));

    await gambleClass.HandleCommand();
    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: `You do not have enough money to bet this much. Check your balance with /balance`,
        ephemeral: true,
    });
  });

  test('When someone plays and successfully burgers someone else, correct database calls are made', async () => {

    const handleGetWhoToLandOnRandomOrYourself = jest.spyOn(Gamble.prototype as any, 'GetWhoToLandOnRandomOrYourself');
    handleGetWhoToLandOnRandomOrYourself.mockImplementation(() => true);

    await gambleClass.HandleCommand();
    expect(mockDatabase.SetHighscores).toHaveBeenCalledTimes(2);
    expect(mockDatabase.SetBurgered).toHaveBeenCalledTimes(1);
    expect(mockDatabase.SetUserCooldown).toHaveBeenCalledTimes(1);
    expect(mockUserWallet.IncreaseUserWalletByAmount).toHaveBeenCalledTimes(1);
  });

  test('When someone plays and burgers themself, correct database calls are made', async () => {

    const handleGetWhoToLandOnRandomOrYourself = jest.spyOn(Gamble.prototype as any, 'GetWhoToLandOnRandomOrYourself');
    handleGetWhoToLandOnRandomOrYourself.mockImplementation(() => false);

    await gambleClass.HandleCommand();
    expect(mockDatabase.SetHighscores).toHaveBeenCalledTimes(1);
    expect(mockDatabase.SetUserCooldown).toHaveBeenCalledTimes(1);
    expect(mockUserWallet.DecreaseUserWallet).toHaveBeenCalledTimes(1);
  });

  test('When someone wagers a bet that is over their allowed max bet, correct reply is displayed', async () => {

    const handleGetWhoToLandOnRandomOrYourself = jest.spyOn(Gamble.prototype as any, 'GetWhoToLandOnRandomOrYourself');
    handleGetWhoToLandOnRandomOrYourself.mockImplementation(() => false);

    mockUserWallet.WagerIsOverMaxUserBet.mockReturnValue(Promise.resolve(true));
    mockUserWallet.GetMaxAllowedBet.mockReturnValue(Promise.resolve(10));

    await gambleClass.HandleCommand();
    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: `You cannot bet this much. The max you can bet is 10 bc`,
        ephemeral: true,
    });
  });

});
