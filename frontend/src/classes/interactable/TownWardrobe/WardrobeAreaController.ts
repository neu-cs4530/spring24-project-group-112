import { useEffect, useState } from 'react';
import {
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

/**
 * The events that the WardrobeAreaController emits to subscribers. These events
 * are only ever emitted to local components (not to the townService).
 */
export type WardrobeAreaEvents = BaseInteractableEventMap & {
  hairChange: (newHair: HairOption | undefined) => void;
  outfitChange: (newOutfit: OutfitOption | undefined) => void;
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
  private _model: WardrobeAreaModel;

  private _townController: TownController;

  private _player?: PlayerController;

  private _chosenHairOption?: HairOption;

  private _chosenOutfitOption?: OutfitOption;

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
    hairOption?: HairOption,
    outfitOption?: OutfitOption,
  ) {
    super(id);
    this._model = wardrobeAreaModel;
    this._townController = townController;
    this._chosenHairOption = hairOption;
    this._chosenOutfitOption = outfitOption;
    if (this._model.user) {
      this._player = this._townController.getPlayer(this._model.user);
    }
  }

  toInteractableAreaModel(): WardrobeAreaModel {
    return this._model;
  }

  protected _updateFrom(newModel: WardrobeAreaModel): void {
    throw new Error('Method not implemented.');
  }

  public isActive(): boolean {
    return this._model.isOpen && this.occupants.length > 0 && this._player !== undefined;
  }

  public get friendlyName(): string {
    return this.id;
  }

  public get type(): string {
    throw new Error('Method not implemented.');
  }
}
