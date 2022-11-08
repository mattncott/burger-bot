import IDatabase from "../../../src/Data/Interfaces/IDatabase";
import IUserWallet from "../../../src/Data/Interfaces/IUserWallet";
import Highscore from "../../../src/Discord/Commands/Highscore";
import { User as UserType } from "../../../src/Types/User";

import { mock } from 'jest-mock-extended';
import { ChatInputCommandInteraction, CommandInteractionOptionResolver, User } from "discord.js";
import { UserWalletType } from "../../../src/Types/UserWallet";
import { HighScoreType } from "../../../src/Types/HighScoreType";



describe('Balance Command tests', () => {

  const mockDatabase = mock<IDatabase>();
  const mockUserWallet = mock<IUserWallet>();
  const mockInteraction = mock<ChatInputCommandInteraction>();
  let classUnderTest = new Highscore(mockInteraction, mockDatabase);

  const mockUser = mock<User>();

  beforeEach(() => {
    mockUser.id = "1232143242";
    mockInteraction.user = mockUser;
    mockInteraction.guildId = "2395829435";
    classUnderTest = new Highscore(mockInteraction, mockDatabase);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Blank guild id throws the correct error', async () => {
    mockInteraction.guildId = null;
    classUnderTest = new Highscore(mockInteraction, mockDatabase);

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

});


function FormatHighScoreArrayToString(highscores: HighScoreType[]): string
{
    const tableResponse: string[] = [];
    
    highscores.forEach((highScore: HighScoreType) => tableResponse.push(
        `<@${highScore.userId}> \n Number of time burgered: ${highScore.numberOfTimesBurgered} \n Number of burgerings performed: ${highScore.numberOfBurgers} \n\n`
        ));

    return tableResponse.toString().replace(',', '');
}