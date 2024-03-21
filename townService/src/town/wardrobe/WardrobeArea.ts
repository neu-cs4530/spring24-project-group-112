import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../../lib/Player';
import InvalidParametersError, { INVALID_COMMAND_MESSAGE } from '../../lib/InvalidParametersError';
import {
  BoundingBox,
  WardrobeArea as WardrobeAreaModel,
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

  public user?: PlayerID;

  public hairChoice?: HairOption;

  public outfitChoice?: OutfitOption;

  protected _session?: Wardrobe;

  public get session(): Wardrobe | undefined {
    return this._session;
  }

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
    { isOpen, hairChoice, outfitChoice, id, occupants }: Omit<WardrobeAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this.isOpen = isOpen;
    this.hairChoice = hairChoice;
    this.outfitChoice = outfitChoice;
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
      this.user = player.id;
      //TODO: Need to create the Wardrobe object somewhere. Do it here when a player is added? Need to get a PlayerController, this class has a Player object.
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
      user: this.user,
      hairChoice: this.hairChoice,
      outfitChoice: this.outfitChoice,
      occupants: this.occupantsByID,
      type: 'WardrobeArea',
    };
  }

  /**
   * Creates a new WardrobeArea object that will represent a Wardrobe Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this wardrobe area exists
   * @param townEmitter An emitter that can be used by this wardrobe area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(mapObject: ITiledMapObject, townEmitter: TownEmitter): WardrobeArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new WardrobeArea(
      {
        isOpen: false,
        user: undefined,
        hairChoice: undefined,
        outfitChoice: undefined,
        id: name as InteractableID,
        occupants: [],
      },
      rect,
      townEmitter,
    );
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === "WardrobeAreaUpdate") {
      this.isOpen = true;
      this.user = player.id;
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    //TODO: Handle commands for joining and leaving the wardrobe area
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
