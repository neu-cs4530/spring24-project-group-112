import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import WardrobeArea from './WardrobeArea';
import Wardrobe from './Wardrobe';
import * as WardrobeModule from './Wardrobe';
import { TownEmitter } from '../../types/CoveyTownSocket';
import { createPlayerForTesting } from '../../TestUtils';
import Player from '../../lib/Player';

class TestingWardrobe extends Wardrobe {
  constructor() {
    super({
      status: 'OPEN',
      hairChoices: [
        { optionID: 1, optionFilePath: 'hairFile1' },
        { optionID: 2, optionFilePath: 'hairFile2' },
      ],
      outfitChoices: [
        { optionID: 1, optionFilePath: 'outfitFile1' },
        { optionID: 2, optionFilePath: 'outfitFile2' },
      ],
    });
  }

  overlap() {
    console.log('Entered wardrobe');
  }

  overlapExit() {
    console.log('Exited wardrobe');
  }

  interact() {
    console.log('Interacting with wardrobe');
  }
}
describe('WardrobeArea', () => {
  let wardrobeArea: WardrobeArea;
  let wardrobe: TestingWardrobe;
  let player: Player;
  let interactableUpdateSpy: jest.SpyInstance;
  const wardrobeConstructorSpy = jest.spyOn(WardrobeModule, 'default');

  beforeEach(() => {
    wardrobeConstructorSpy.mockClear();
    wardrobe = new TestingWardrobe();
    wardrobeConstructorSpy.mockReturnValue(wardrobe);

    player = createPlayerForTesting();

    wardrobeArea = new WardrobeArea(
      nanoid(),
      { x: 0, y: 0, width: 100, height: 100 },
      mock<TownEmitter>(),
      [
        { optionID: 1, optionFilePath: 'hairFile1' },
        { optionID: 2, optionFilePath: 'hairFile2' },
      ],
      [
        { optionID: 1, optionFilePath: 'outfitFile1' },
        { optionID: 2, optionFilePath: 'outfitFile2' },
      ],
    );

    wardrobeArea.add(player);
    // wardrobe.join(player);

    // Borrowing these two lines from ConnectFourGameArea.test.ts, suppresses error
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Test requires access to protected method)
    interactableUpdateSpy = jest.spyOn(wardrobeArea, '_emitAreaChanged');
  });

  describe('JoinGame command', () => {
    test('JoinGame command should create a new Wardrobe session if one does not exist', () => {
      expect(wardrobeArea.session).toBeUndefined();
      wardrobeArea.handleCommand({ type: 'JoinGame' }, player);
      expect(wardrobeArea.session).toBeDefined();
      expect(interactableUpdateSpy).toHaveBeenCalled();
    });
  });
  describe('LeaveGame command', () => {
    test('LeaveGame command should remove player from Wardrobe if they are present', () => {
      wardrobeArea.handleCommand({ type: 'JoinGame' }, player);
      expect(wardrobeArea.occupants).toEqual([player]);
      wardrobeArea.handleCommand({ type: 'LeaveGame', gameID: 'testID' }, player);
      expect(wardrobeArea.occupants).toHaveLength(0);
      expect(interactableUpdateSpy).toHaveBeenCalled();
    });
    test;
  });
  describe('Unknown command', () => {
    test('An unknown command should throw an error', () => {
      expect(() =>
        wardrobeArea.handleCommand({ type: 'StartGame', gameID: 'ID' }, player),
      ).toThrowError();
    });
  });
});
