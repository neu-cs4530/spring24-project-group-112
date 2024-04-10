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
  WardrobeInstance,
} from '../../types/CoveyTownSocket';
import Wardrobe from './Wardrobe';
import InteractableArea from '../InteractableArea';

export default class WardrobeArea extends InteractableArea {
  public isOpen: boolean;

  public user?: PlayerID;

  protected _session?: Wardrobe;

  public get session(): Wardrobe | undefined {
    return this._session;
  }

  private _stateUpdated(updatedState: WardrobeAreaModel) {
    console.log("State updated in WardrobeArea");
    if (updatedState.user) {
      this.isOpen = false;
    } else {
      this.isOpen = true;
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
    return this._occupants.length > 0 && this.isOpen;
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
  ) {
    super(id, coordinates, townEmitter);
    this.isOpen = true;
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
      console.log('Adding player to wardrobe area');
      super.add(player);
      this.isOpen = true;
      this.user = player.id;
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
    console.log('Removing player from wardrobe area');
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
      user: this.user,
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
  public static fromMapObject(mapObject: ITiledMapObject, townEmitter: TownEmitter): WardrobeArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new WardrobeArea(
      name as InteractableID,
      rect,
      townEmitter,
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

  /**
   * Handles the commands that can be sent to the wardrobe area.
   * 
   * @param command command to handle
   * @param player player making the request
   * @returns the result of the command
   * @throws InvalidParametersError if the command is not valid
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    let wardrobe = this._session;
    if (command.type === 'JoinWardrobe') {
      if (!wardrobe) {
        console.log("Making a new wardrobe");
        wardrobe = new Wardrobe({
          status: 'OCCUPIED',
        });
        this._session = wardrobe;
      }
      wardrobe.join(player);
      this._stateUpdated(wardrobe.toModel());
      return { gameID: wardrobe.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveWardrobe') {
      if (!wardrobe) {
        throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
      }
      wardrobe.leave(player);
      this._stateUpdated(wardrobe.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
