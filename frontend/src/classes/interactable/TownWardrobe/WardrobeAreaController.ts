import {
  GameInstanceID,
  HairOption,
  OutfitOption,
  WardrobeArea as WardrobeAreaModel,
  WardrobeStatus,
} from '../../../types/CoveyTownSocket';
import PlayerController from '../../PlayerController';
import InteractableAreaController, {
  BaseInteractableEventMap,
  WARDROBE_AREA_TYPE,
} from '../InteractableAreaController';
import TownController from '../../TownController';

/**
 * The events that the WardrobeAreaController emits to subscribers. These events
 * are only ever emitted to local components (not to the townService).
 */
export type WardrobeAreaEvents = BaseInteractableEventMap & {
  hairChange: (newHair: HairOption) => void;
  outfitChange: (newOutfit: OutfitOption) => void;
  playerChange: (newPlayer: PlayerController | undefined) => void;
};

// export const NO_HAIR_OBJECT = { optionID: -1, optionFilePath: '(No filepath)' } as HairOption;
// export const NO_OUTFIT_OBJECT = { optionID: -1, optionFilePath: '(No filepath)' } as OutfitOption;

/**
 * A WardrobeAreaController manages the local behavior of a wardrobe area in the frontend,
 * implementing the logic to bridge between the townService's interpretation of wardrobe areas and the
 * frontend's. The WardrobeAreaController emits events when the wardrobe area changes.
 *
 * The original intention was for this controller and the corresponding InteractableAreaModel to
 * function like that of game areas, but obviously there are some inconsistencies in the implementation.
 *
 * This controller relies on a setter to update the player controller, which is not ideal.
 * The player controller is used to update the player's appearance: their hair or outfit options.
 */
export default class WardrobeAreaController extends InteractableAreaController<
  WardrobeAreaEvents,
  WardrobeAreaModel
> {
  protected _instanceID?: GameInstanceID;

  private _model: WardrobeAreaModel;

  private _townController: TownController;

  private _player?: PlayerController;

  /**
   * Create a new WardrobeAreaController
   * @param id
   * @param wardrobeAreaModel
   * @param townController
   */
  constructor(id: string, wardrobeAreaModel: WardrobeAreaModel, townController: TownController) {
    super(id);
    this._model = wardrobeAreaModel;
    this._townController = townController;

    if (this._model.session?.player) {
      this._player = this._townController.getPlayer(this._model.session?.player);
    }
  }

  /**
   * Returns the player controller of the player in the wardrobe
   * or undefined if there is no player in the wardrobe.
   *
   * @returns The player controller of the player in the wardrobe, or undefined if there is no player in the wardrobe
   */
  get player(): PlayerController | undefined {
    return this._player;
  }

  set player(player: PlayerController | undefined) {
    this._player = player;
  }

  /**
   * Returns the status of the wardrobe
   */
  get status(): WardrobeStatus {
    return this._model.isOpen ? 'OPEN' : 'OCCUPIED';
  }

  /**
   * Sends a request to the server to join the current wardrobe in the area, or create a new one if there is no game in progress.
   *
   * @throws An error if the server rejects the request to join the game.
   */
  public async joinWardrobe() {
    const { gameID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'JoinWardrobe',
    });
    this._instanceID = gameID;
    console.log('Player joined the wardrobe successfully!');
  }

  /**
   * Sends a request to the server to leave the current game in the game area.
   */
  public async leaveWardrobe() {
    const instanceID = this._instanceID;
    if (instanceID) {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'LeaveWardrobe',
        gameID: instanceID,
      });
    }
  }

  toInteractableAreaModel(): WardrobeAreaModel {
    return this._model;
  }

  protected _updateFrom(newModel: WardrobeAreaModel): void {
    this._model = newModel;
    console.log(newModel);
    if (this._model.session?.player) {
      this._player = this._townController.getPlayer(this._model.session?.player);
    } else {
      this._player = undefined;
    }
  }

  public isActive(): boolean {
    return this._model.isOpen && this.occupants.length > 0 && this._player !== undefined;
  }

  public get friendlyName(): string {
    return this.id;
  }

  public get type(): string {
    return WARDROBE_AREA_TYPE;
  }

  /**
   * Handles changing the player's appearance by updating the player's hair or outfit options.
   * Called from the wardrobe UI.
   *
   * @param hair
   * @param outfit
   */
  public changeAppearance(hair: HairOption | undefined, outfit: OutfitOption | undefined): void {
    if (!this._player) {
      throw new Error('Player not in wardrobe');
    }
    if (hair) {
      this._player.hairSelection = hair;
      this._player.savePlayer();
      this.emit('playerChange', this._player);
    }
    if (outfit) {
      this._player.outfitSelection = outfit;
      this._player.savePlayer();
      this.emit('playerChange', this._player);
    }
  }
}
