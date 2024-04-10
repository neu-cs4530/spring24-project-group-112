import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import { nanoid } from 'nanoid';
import Player from '../../lib/Player';
import InvalidParametersError, { INVALID_COMMAND_MESSAGE } from '../../lib/InvalidParametersError';
import {
  BoundingBox,
  WardrobeArea as WardrobeAreaModel,
  WardrobeState,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
  HairOption,
  OutfitOption,
  InteractableID,
  PlayerID,
} from '../../types/CoveyTownSocket';
import Wardrobe from './Wardrobe';
import InteractableArea from '../InteractableArea';

export default class WardrobeArea extends InteractableArea {
  public isOpen: boolean;

  //public user?: PlayerID;

  //public hairChoices: Array<HairOption>;

  //public outfitChoices: Array<OutfitOption>;

  //protected _session?: Wardrobe;

  /*public get session(): Wardrobe | undefined {
    return this._session;
  }*/

  // Is this needed?
  private _stateUpdated(updatedState: WardrobeState) {
    if (updatedState.status === 'OCCUPIED') {
      this.isOpen = false;
    }
    this._emitAreaChanged();
  }

  /**
   * WardrobeArea exists publically, but the wardrobe session is private.
   * WardrobeArea is persistent, but the wardrobe session is temporary.
   * Only one player allowed in WardrobeArea at a time
   * If other player tries to join, give "Occupied" message
   */

  /** The conversation area is "active" when there are players inside of it  */
  public get isActive(): boolean {
    return this._occupants.length > 0;
  }

  /**
   * Creates a new WardrobeArea
   * @param wardrobeAreaModel model containing this area's hair and outfit options
   * @param coordinates the bounding box that defines this wardrobe area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    id: string,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
    hairChoices: Array<HairOption>,
    outfitChoices: Array<OutfitOption>,
  ) {
    super(id, coordinates, townEmitter);
    this.isOpen = true;
    //this.hairChoices = hairChoices;
    //this.outfitChoices = outfitChoices;
  }

  /**
   * Adds a player to the wardrobe area.
   * When the first player enters, this method sets the room as open and emits that update to all of the players.
   * If the wardrobe area is already occupied, this method throws an error as only one player can be in the wardrobe area at a time.
   *
   * @throws Error if the wardrobe area is already occupied (occupants.length > 0)
   *
   * @param player Player to add
   */
  public add(player: Player): void {
    if (this._occupants.length > 0) {
      throw new Error('WardrobeArea is already occupied');
    } else {
      super.add(player);
      this.isOpen = true;
      //this.user = player.id;
    }
  }

  /**
   * Removes a player from this wardrobe area.
   * When the last player leaves, this method sets the room as closed and
   * emits that update to all of the players.
   *
   * @param player
   */
  public remove(player: Player): void {
    super.remove(player);
    if (this._occupants.length === 0) {
      this.isOpen = false;
    }
  }

  /**
   * Convert this WardrobeArea instance to a simple WardrobeAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): WardrobeAreaModel {
    return {
      id: this.id,
      isOpen: this.isOpen,
      //user: this.user,
      occupants: this.occupantsByID,
      type: 'WardrobeArea',
    };
  }

  /**
   * Creates a new WardrobeArea object that will represent a Wardrobe Area object in the town map with a random ID.
   *
   * @param mapObject An ITiledMapObject that represents a rectangle in which this wardrobe area exists
   * @param townEmitter An emitter that can be used by this wardrobe area to broadcast updates to players in the town
   * @returns the WardrobeArea object
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    townEmitter: TownEmitter
  ): WardrobeArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    console.log("Creating new WardrobeArea object");
    console.log(mapObject.x);
    console.log(mapObject.y);
    return new WardrobeArea(
      nanoid(),
      rect,
      townEmitter,
      [],
      [], // Need to find the proper way to load the hair and outfit options
    );
  }

  /**
   * 'JoinGame' command is what starts the customization process
   * 'ApplyMove' command is what applies the customization to the player
   * 'LeaveGame' command is what ends the customization process and saves the changes
   * should this also end the Wardrobe session (delete the object?)
   *
   * Use the same commands as the ConnectFourGameArea?
   */

  /*public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    // applyChange is handled by the wardrobe itself, not in the WardrobeArea
    if (command.type === 'JoinWardrobe') {
      let session = this._session;
      if (!session) {
        // No session in progress, make a new one
        session = new Wardrobe({
          status: 'OCCUPIED',
          player: player.id,
        });
        this._session = session;
      }
      session.join(player);
      this._emitAreaChanged();
      // Is this the right return here?
      return { gameID: session.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveWardrobe') {
      const session = this._session;
      if (!session) {
        throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
      }
      // TODO: When player leaves the wardrobe, save changes to the Firebase DB
      session.leave(player);
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }*/
  public handleCommand<
    CommandType extends InteractableCommand,
  >(): InteractableCommandReturnType<CommandType> {
    throw new InvalidParametersError('Unknown command type');
  }
}
