import { nanoid } from 'nanoid';
import InvalidParametersError, { INVALID_COMMAND_MESSAGE } from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  GameInstanceID,
  HairOption,
  InteractableCommand,
  InteractableCommandReturnType,
  OutfitOption,
  WardrobeArea,
  WardrobeInstance,
  WardrobeState,
} from '../../types/CoveyTownSocket';

export default class Wardrobe {
  private _player?: Player;

  public readonly id: GameInstanceID;

  private _hairOptions: Array<HairOption>;

  private _outfitOptions: Array<OutfitOption>;

  private _state: WardrobeState;

  /**
   * 'JoinGame' command is what starts the customization process
   * 'ApplyMove' command is what applies the customization to the player
   * 'LeaveGame' command is what ends the customization process and saves the changes
   * should this also end the Wardrobe session (delete the object?)
   *
   * Need Player field for this object?
   */

  public constructor(initialState: WardrobeState) {
    // this._player = playerToChange;
    this.id = nanoid() as GameInstanceID;
    this._state = initialState;
    this._hairOptions = [];
    this._outfitOptions = [];
  }

  public get state(): WardrobeState {
    return this._state;
  }

  public set state(newState: WardrobeState) {
    this._state = newState;
  }

  /**
   * Adds a player to the wardrobe
   *
   * @throws Error if the wardrobe is already occupied
   *
   * @param player Player to join the wardrobe
   */
  public async join(player: Player): Promise<void> {
    if (this._player) {
      throw new InvalidParametersError('Wardrobe is already occupied');
    }
    console.log("Joining player to wardrobe");
    this._player = player;
  }

  /**
   * Leaves the wardrobe
   * 
   * @param player 
   */
  public leave(player: Player): void {
    if (!this._player || player !== this._player) {
      throw new Error('Player not found');
    }
    this._player = undefined;
  }

  /**
   * Removes player from the wardrobe
   *
   * @throws Error if the player is not found
   */
  public toModel(): WardrobeArea {
    return {
      type: "WardrobeArea",
      id: this.id,
      occupants: this._player ? [this._player.id] : [],
      isOpen: this._player === undefined,
      user: this._player?.id,
      session: {
        id: this.id,
        player: this._player?.id,
      }
    };
  }
}
