import Wardrobe from './Wardrobe';
import Player from '../../lib/Player';
import PlayerController from '../../../../frontend/src/classes/PlayerController';
import { createPlayerForTesting } from '../../TestUtils';
import {
    HairOption,
    OutfitOption,
    WardrobeState,
} from '../../types/CoveyTownSocket';

describe('Wardrobe', () => {
    let wardrobe: Wardrobe;
    let player: Player;
    let hairChoices: HairOption[];
    let outfitChoices: OutfitOption[];
    let wardrobeState: WardrobeState;
    beforeEach(() => {
        hairChoices = [
            { optionID: 1, optionFilePath: "hairFile1" },
            { optionID: 2, optionFilePath: "hairFile2"},
        ];
        outfitChoices = [
            { optionID: 1, optionFilePath: "outfitFile1" },
            { optionID: 2, optionFilePath: "outfitFile2"},
        ];
        wardrobeState = {
            status: 'OPEN',
            hairChoices,
            outfitChoices,
        };
        wardrobe = new Wardrobe(wardrobeState);
        player = createPlayerForTesting();
    })

    describe('applyChange', () => {
        it('should throw an error if the player is not found', () => {
            expect(() => wardrobe.applyChange(1, true)).toThrowError('Player not found');
        });
        it('should throw an error if the hair option is not found', () => {
            wardrobe.join(player);

            expect(() => wardrobe.applyChange(3, true)).toThrowError('Hair option not found');
        });
        it('should throw an error if the outfit option is not found', () => {
            wardrobe.join(player);

            expect(() => wardrobe.applyChange(5, false)).toThrowError('Outfit option not found');
        });
        // Need more tests for this functionality, local dependency errors are preventing this
    });
});