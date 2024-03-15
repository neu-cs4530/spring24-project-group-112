import { useEffect, useState } from 'react';
import {
  HairOption,
  OutfitOption,
  WardrobeArea as WardrobeAreaModel,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import InteractableAreaController, {
  BaseInteractableEventMap,
  WARDROBE_AREA_TYPE,
} from './InteractableAreaController';

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
  toInteractableAreaModel(): WardrobeAreaModel {
    throw new Error('Method not implemented.');
  }

  protected _updateFrom(newModel: WardrobeAreaModel): void {
    throw new Error('Method not implemented.');
  }

  public isActive(): boolean {
    throw new Error('Method not implemented.');
  }

  public get friendlyName(): string {
    throw new Error('Method not implemented.');
  }

  public get type(): string {
    throw new Error('Method not implemented.');
  }
}
