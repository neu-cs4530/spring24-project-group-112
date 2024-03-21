import PlayerController from '../../../../frontend/src/classes/PlayerController';
import { HairOption, OutfitOption } from '../../types/CoveyTownSocket';

export default class Wardrobe {
  private _player?: PlayerController;

  private _hairOptions: Array<HairOption>;

  private _outfitOptions: Array<OutfitOption>;

  private _loadHairOptions(): Array<HairOption> {
    return Array<HairOption>();
  }

  private _loadOutfitOptions(): Array<OutfitOption> {
    return Array<OutfitOption>();
  }

  /**
   * FIXME: How should the constructor work?
   * Should there be a new instance of a wardrobe for a new player?
   * Should the player be removed from the constructor?
   */
  public constructor(playerToChange: PlayerController) {
    this._player = playerToChange;
    this._hairOptions = this._loadHairOptions();
    this._outfitOptions = this._loadOutfitOptions();
  }

  /**
   * Applies the change to the player's hair or outfit based on the optionID
   * 
   * @throws Error if the player is not found
   * 
   * @param optionID optionID of the hair or outfit option to apply to player
   * @param isHair flag to determine if the change is for hair or outfit
   */
  public applyChange(optionID: number, isHair: boolean): void {
    // Select the hair or outfit option based on the optionID
    if (!this._player) {
      throw new Error("Player not found");
    }
    if (isHair) {
      let hairOption = this._hairOptions.find(obj => obj.optionID === optionID);
      if (hairOption) {
        this._player.hair = hairOption.optionFilePath;
      } else {
        //TODO: Make a new error type for these errors?
        throw new Error("Hair option not found");
      }
    } else {
      let outfitChoice = this._outfitOptions.find(obj => obj.optionID === optionID);
      if (outfitChoice) {
        this._player.outfit = outfitChoice.optionFilePath;
      } else {
        throw new Error("Outfit option not found");
      }
    }
  }

  /**
   * Adds a player to the wardrobe
   * 
   * @throws Error if the wardrobe is already occupied
   * 
   * @param player Player to join the wardrobe
   */
  public join(player: PlayerController): void {
    if (this._player) {
      throw new Error("Wardrobe is already occupied");
    }
    this._player = player;
  }

  /**
   * Removes player from the wardrobe
   * 
   * @throws Error if the player is not found
   */
  public leave(): void {
    if (!this._player) {
      throw new Error("Player not found");
    }
    this._player = undefined;
  }

  public toModel(): Wardrobe {
    return this;
  }
}
