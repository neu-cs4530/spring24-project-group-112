import Interactable, { KnownInteractableTypes } from '../Interactable';
import WardrobeWrapper from './WardrobeArea';

export default class WardrobeArea extends Interactable {
  private _labelText?: JSX.Element;

  private _defaultVideoURL?: string;

  private _isInteracting = false;

  addedToScene() {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);
    this.setDepth(-1);
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y + this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
  }

  overlap(): void {
    this._isInteracting = true;
    console.log('Entered wardrobe');
    this.townController.interactableEmitter.emit('wardrobeArea', this);
  }

  overlapExit(): void {
    if (this._isInteracting) {
      this.townController.interactableEmitter.emit('endInteraction', this);
      this._isInteracting = false;
    }
  }

  interact(): void {
    console.log('Interacting with wardrobe');
  }

  getType(): KnownInteractableTypes {
    return 'wardrobeArea';
  }
}
