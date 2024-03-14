import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import InvalidParametersError from '../lib/InvalidParametersError';
import {
  BoundingBox,
  WardrobeArea as WardrobeAreaModel,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
  HairOption,
  OutfitOption,
  InteractableID,
  WardrobeAreaUpdateCommand,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class WardrobeArea extends InteractableArea {
  public isOpen: boolean;

  public hairOptions: Array<HairOption>;

  public outfitOptions: Array<OutfitOption>;

  /**
   * Creates a new WardrobeArea
   * @param wardrobeAreaModel model containing this area's hair and outfit options
   * @param coordinates the bounding box that defines this wardrobe area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { isOpen, hairOptions, outfitOptions, id }: Omit<WardrobeAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this.isOpen = isOpen;
    this.hairOptions = hairOptions;
    this.outfitOptions = outfitOptions;
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
      hairOptions: this.hairOptions,
      outfitOptions: this.outfitOptions,
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
        hairOptions: Array<HairOption>(),
        outfitOptions: Array<OutfitOption>(),
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
    throw new InvalidParametersError('Unknown command type');
  }
}