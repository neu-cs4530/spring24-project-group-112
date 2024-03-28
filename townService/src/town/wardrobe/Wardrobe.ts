import PlayerController from '../../lib/Player';
import { HairOption, OutfitOption } from '../../types/CoveyTownSocket';

export default class Wardrobe {
  private _player: PlayerController;

  private _hairOptions: Array<HairOption>;

  private _outfitOptions: Array<OutfitOption>;

  private _loadHairOptions(): Array<HairOption> {
    return Array<HairOption>();
  }

  private _loadOutfitOptions(): Array<OutfitOption> {
    return Array<OutfitOption>();
  }

  public constructor(playerToChange: PlayerController) {
    this._player = playerToChange;
    this._hairOptions = this._loadHairOptions();
    this._outfitOptions = this._loadOutfitOptions();
  }

  public applyChange(optionID: number, isHair: boolean): void {}
}
