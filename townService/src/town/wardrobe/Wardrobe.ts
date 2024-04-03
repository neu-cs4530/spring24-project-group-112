import PlayerController from '../../../../frontend/src/classes/PlayerController';
import fromPlayerModel from '../../../../frontend/src/classes/PlayerController';
import Player from '../../lib/Player';
import toPlayerModel from '../../lib/Player';
import { HairOption, OutfitOption, WardrobeState } from '../../types/CoveyTownSocket';

export default class Wardrobe {
  private _player?: Player;

  private _controller?: PlayerController;

  private _hairOptions: Array<HairOption>;

  private _outfitOptions: Array<OutfitOption>;

  private _state: WardrobeState;

  private _loadHairOptions(): Array<HairOption> {
    return Array<HairOption>();
  }

  private _loadOutfitOptions(): Array<OutfitOption> {
    return Array<OutfitOption>();
  }

  /**
   * 'JoinGame' command is what starts the customization process
   * 'ApplyMove' command is what applies the customization to the player
   * 'LeaveGame' command is what ends the customization process and saves the changes
   * should this also end the Wardrobe session (delete the object?)
   * 
   * Need Player field for this object?
   */

  public constructor(initialState: WardrobeState) {
    //this._player = playerToChange;
    this._state = initialState;
    this._hairOptions = initialState.hairChoices;
    this._outfitOptions = initialState.outfitChoices;
  }

  public get state(): WardrobeState {
    return this._state;
  }

  public set state(newState: WardrobeState) {
    this._state = newState;
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
    if (!this._controller) {
      throw new Error("Player not found");
    }
    const controller = this._controller;
    if (isHair) {
      const hairOption = this._hairOptions.find(obj => obj.optionID === optionID);
      if (hairOption) {
        controller.hair = hairOption.optionFilePath;
      } else {
        throw new Error("Hair option not found");
      }
    } else {
      const outfitChoice = this._outfitOptions.find(obj => obj.optionID === optionID);
      if (outfitChoice) {
        controller.outfit = outfitChoice.optionFilePath;
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
  public join(player: Player): void {
    if (this._player) {
      throw new Error("Wardrobe is already occupied");
    }
    this._player = player;
    // Set the controller to the player's controller
    // Need to replace the previous controller with this one?
    this._controller = PlayerController.fromPlayerModel(player.toPlayerModel()); // Call the fromPlayerModel function
  }

  /**
   * Removes player from the wardrobe
   * 
   * @throws Error if the player is not found
   */
  public leave(player: Player): void {
    if (!this._player || player !== this._player) {
      throw new Error("Player not found");
    }
    this._player = undefined;
  }
}
