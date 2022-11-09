import IDatabase from "../../../src/Data/Interfaces/IDatabase";
import IUserWallet from "../../../src/Data/Interfaces/IUserWallet";
import Highscore from "../../../src/Discord/Commands/Highscore";
import { User as UserType } from "../../../src/Types/User";

import { mock } from 'jest-mock-extended';
import { Channel, ChatInputCommandInteraction, Client, Collection, CommandInteractionOptionResolver, Guild, GuildMember, Role, User } from "discord.js";
import { UserWalletType } from "../../../src/Types/UserWallet";
import { HighScoreType } from "../../../src/Types/HighScoreType";
import BaseDiscord from "../../../src/Discord/BaseDiscord";



describe('Balance Command tests', () => {

  const mockDatabase = mock<IDatabase>();
  const mockInteraction = mock<ChatInputCommandInteraction>();
  const mockClient = mock<Client>();
  let classUnderTest = new Highscore(mockInteraction, mockClient, mockDatabase);

  const mockUser = mock<User>();

  beforeEach(() => {
    mockUser.id = "1232143242";
    mockInteraction.user = mockUser;
    mockInteraction.guildId = "2395829435";
    classUnderTest = new Highscore(mockInteraction, mockClient, mockDatabase);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Blank guild id throws the correct error', async () => {
    mockInteraction.guildId = null;
    classUnderTest = new Highscore(mockInteraction, mockClient, mockDatabase);

    await classUnderTest.HandleCommand();
    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledWith("This command is only allowed from within a server.");
  });

  test('No saved highscores displays the correct reply', async () => {

    const highscores: HighScoreType[] = [];

    mockDatabase.GetAllHighscores.mockReturnValue(Promise.resolve(highscores));

    await classUnderTest.HandleCommand();
    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: "No highscores have been created yet. Burger someone to get started!",
        ephemeral: true
    });
  });

  test('Highscores display in the correct format', async () => {
    const highscores: HighScoreType[] = [
        { id: "1", userId: "1232143242", numberOfBurgers: 1, numberOfTimesBurgered: 32 },
        { id: "2", userId: "1232143442", numberOfBurgers: 32, numberOfTimesBurgered: 1 }
    ];

    mockDatabase.GetAllHighscores.mockReturnValue(Promise.resolve(highscores));

    const expectedResult = FormatHighScoreArrayToString(highscores)

    await classUnderTest.HandleCommand();
    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledWith(expectedResult);
  });

  test('When member is in MostBurgeredRole, calls RemoveUserFromRole', async () => {

    mockDatabase.GetAllGuilds.mockReturnValue(Promise.resolve([{id: "3242342"}]));

    SetupMocksForMostBurgeredTests();
    jest.spyOn(BaseDiscord.prototype as any, 'SendMessageToChannel')
      .mockImplementation(() => {});

    const spiedClass = jest.spyOn(BaseDiscord.prototype as any, 'RemoveUserFromRole');

    await classUnderTest.CalculateMostBurgeredToday();

    expect(spiedClass).toHaveBeenCalledTimes(1);
  });

  test('When calculating most burgered role, message appears to server correctly', async () => {

    mockDatabase.GetAllGuilds.mockReturnValue(Promise.resolve([{id: "3242342"}]));

    SetupMocksForMostBurgeredTests();

    const highscores: HighScoreType[] = [
        { id: "1", userId: "1232143242", numberOfBurgers: 1, numberOfTimesBurgered: 32 },
        { id: "2", userId: "1232143442", numberOfBurgers: 32, numberOfTimesBurgered: 1 }
    ];

    mockDatabase.GetAllHighscores.mockReturnValue(Promise.resolve(highscores));

    const spiedClass = jest.spyOn(BaseDiscord.prototype as any, 'SendMessageToChannel')
      .mockImplementation(() => {});

    await classUnderTest.CalculateMostBurgeredToday();

    expect(spiedClass).toHaveBeenCalledTimes(1);
    expect(spiedClass).toHaveBeenCalledWith("435345556", "<@1232143242> was the most burgered today! They've been given the most burgered role!")
  });

});

function SetupMocksForMostBurgeredTests()
{
  const members = mock<Collection<string, GuildMember>>();
  const mockGuildMember: GuildMember[] = [ mock<GuildMember>() ];
  members.first.mockReturnValue(mockGuildMember);

  jest.spyOn(BaseDiscord.prototype as any, 'GetDiscordGuild')
    .mockImplementation(() => { return {id: "3242342"} as Guild });

  jest.spyOn(BaseDiscord.prototype as any, 'GetOrCreateRole')
    .mockImplementation(() => { return {members} as unknown as Role });

  jest.spyOn(BaseDiscord.prototype as any, 'GetChannelToSendMessageTo')
    .mockImplementation(() => { return {id: "435345556"} as Channel });

  jest.spyOn(BaseDiscord.prototype as any, 'AddUserToRole')
    .mockImplementation(() => {});
}


function FormatHighScoreArrayToString(highscores: HighScoreType[]): string
{
    const tableResponse: string[] = [];
    
    highscores.forEach((highScore: HighScoreType) => tableResponse.push(
        `<@${highScore.userId}> \n Number of time burgered: ${highScore.numberOfTimesBurgered} \n Number of burgerings performed: ${highScore.numberOfBurgers} \n\n`
        ));

    return tableResponse.toString().replace(',', '');
}