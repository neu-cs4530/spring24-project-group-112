import {
  GameInstanceID,
  HairOption,
  OutfitOption,
  WardrobeArea as WardrobeAreaModel,
} from '../../../types/CoveyTownSocket';
import PlayerController from '../../PlayerController';
import InteractableAreaController, {
  BaseInteractableEventMap,
  WARDROBE_AREA_TYPE,
} from '../InteractableAreaController';
import TownController from '../../TownController';
import { doc, getFirestore, updateDoc } from 'firebase/firestore';

import firebase from 'firebase/app';
import 'firebase/firestore';

/**
 * The events that the WardrobeAreaController emits to subscribers. These events
 * are only ever emitted to local components (not to the townService).
 */
export type WardrobeAreaEvents = BaseInteractableEventMap & {
  //hairChange: (newHair: HairOption | undefined) => void;
  //outfitChange: (newOutfit: OutfitOption | undefined) => void;
  playersChange: (newPlayer: PlayerController[]) => void;
};

export const NO_HAIR_OBJECT = { optionID: -1, optionFilePath: '(No filepath)' } as HairOption;
export const NO_OUTFIT_OBJECT = { optionID: -1, optionFilePath: '(No filepath)' } as OutfitOption;

/**
 * A WardrobeAreaController manages the local behavior of a wardrobe area in the frontend,
 * implementing the logic to bridge between the townService's interpretation of wardrobe areas and the
 * frontend's. The WardrobeAreaController emits events when the wardrobe area changes.
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
   * @param hairOption
   * @param outfitOption
   */
  constructor(
    id: string,
    wardrobeAreaModel: WardrobeAreaModel,
    townController: TownController,
  ) {
    super(id);
    this._model = wardrobeAreaModel;
    this._townController = townController;
    if (this._model.session?.player) {
      this._player = this._townController.getPlayer(this._model.session?.player);
    }
  }

  /**
   * Sends a request to the server to join the current game in the game area, or create a new one if there is no game in progress.
   *
   * @throws An error if the server rejects the request to join the game.
   */
  public async joinGame() {
    const { gameID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'JoinWardrobe',
    });
    this._instanceID = gameID;
  }

  /**
   * Sends a request to the server to leave the current game in the game area.
   */
  public async leaveGame() {
    const instanceID = this._instanceID;
    if (instanceID) {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'LeaveWardrobe',
        gameID: instanceID,
      });
    }
    const db = getFirestore();

    try {
      const userDocRef = doc(db, 'accounts', this._player?.id ?? '');

      const customizationData = {
        hairoption: this._player?.gameObjects ?? NO_HAIR_OBJECT,
        outfitOption: NO_OUTFIT_OBJECT,
      };

      // Save data to Firestore for the specified user ID
      await updateDoc(userDocRef, customizationData);
      console.log('Customization saved to Firestore successfully!');
    } catch (error) {
      console.error('Error saving customization to Firestore.');
    }

    // const db = getFirestore();
    // const accountsRef = doc(db, 'accounts', this._player?.id); // Assuming player ID is used as the document ID
    // try {
    //   await updateDoc(accountsRef, {
    //     hairoption: this.hairOption,
    //     outfitOption: this._model.outfitOption,
    //   });
    //   console.log('Hair and outfit options updated in the accounts document.');
    //   } catch (error) {
    //     console.error('Error updating hair and outfit options:', error);
    //     // Handle error as needed
    //   }
    // } else {
    //   console.warn('Instance ID not found. Cannot update hair and outfit options.');
    //   // Handle scenario where instance ID is missing
    // }
    
  }

  toInteractableAreaModel(): WardrobeAreaModel {
    return this._model;
  }

  protected _updateFrom(newModel: WardrobeAreaModel): void {
    // If players change
    const newPlayer = newModel.session?.player ? this._townController.getPlayer(newModel.session.player) : undefined;
    if (newPlayer) {
      this._player = newPlayer;
      this.emit('playersChange', [newPlayer]);
    } else {
      this._player = undefined;
      this.emit('playersChange', []);
    }
    this._instanceID = newModel.session?.id ?? undefined;
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
}
