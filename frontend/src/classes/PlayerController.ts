import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { Player as PlayerModel, PlayerLocation } from '../types/CoveyTownSocket';
import { error } from 'console';
export const MOVEMENT_SPEED = 175;

export type PlayerEvents = {
  movement: (newLocation: PlayerLocation) => void;
};

export type PlayerGameObjects = {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  label: Phaser.GameObjects.Text;
  locationManagedByGameScene: boolean /* For the local player, the game scene will calculate the current location, and we should NOT apply updates when we receive events */;
};

/**
 * This prototype player game object includes:
 * - A GameObject.Sprite that represents the body as a sprite 
 * - A Physics.Arcade.Body that represents the dynamic body component attached to the body
 * - A GameObject.Layer that stores 3 different components
 * 
 * The layer contains two GameObject.Sprite objects: Hair and Outfit.
 * 
 * 
 */
export type PrototypePlayerGameObjects = {
  bodySprite: Phaser.GameObjects.Sprite; 
  bodyPhysics: Phaser.Physics.Arcade.Body;
  layer: Phaser.GameObjects.Layer;
  label: Phaser.GameObjects.Text;
  locationManagedByGameScene: boolean; /* For the local player, the game scene will calculate the current location, and we should NOT apply updates when we receive events */
};
export default class PlayerController extends (EventEmitter as new () => TypedEmitter<PlayerEvents>) {
  private _location: PlayerLocation;

  private readonly _id: string;

  private readonly _userName: string;

  public gameObjects?: PrototypePlayerGameObjects;

  constructor(id: string, userName: string, location: PlayerLocation) {
    super();
    this._id = id;
    this._userName = userName;
    this._location = location;
  }

  set location(newLocation: PlayerLocation) {
    this._location = newLocation;
    this._updateGameComponentLocation();
    this.emit('movement', newLocation);
  }

  get location(): PlayerLocation {
    return this._location;
  }

  /**
   * Sets the texture of the new hair selected in the wardrobe.
   * @throws 'No body detected' if the game object of this player is undefined.
   * @throws 'Hair component is not a Sprite object' if the found hair gameobject is not an instance of a sprite.
   * @param file path of the image of the hair 
   */
  set hair(newHair: string) {
    if (this.gameObjects === undefined) {
      throw error('No body detected');
    }
    const layerChildren = this.gameObjects.layer.getChildren();
    const hairComponent = layerChildren[0];
    if (!(hairComponent instanceof Phaser.GameObjects.Sprite)) {
      throw error('Hair component is not a Sprite object');
    }
    hairComponent.setTexture(newHair);
  }

  /**
   * Sets the texture of the new outfit selected in the wardrobe.
   * @throws 'No body detected' if the game object of this player is undefined.
   * @throws 'Outfit component is not a Sprite object' if the found hair gameobject is not an instance of a sprite.
   * @param file path of the image of the outfit
   */
  set outfit(newOutfit: string) {
    if (this.gameObjects === undefined) {
      throw error('No body detected');
    }
    const layerChildren = this.gameObjects.layer.getChildren();
    const outfitComponent = layerChildren[1];
    if (!(outfitComponent instanceof Phaser.GameObjects.Sprite)) {
      throw error('Outfit component is not a Sprite object');
    }
    outfitComponent.setTexture(newOutfit);
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  toPlayerModel(): PlayerModel {
    return { id: this.id, userName: this.userName, location: this.location };
  }


  private _updateGameComponentLocation() {
    if (this.gameObjects && !this.gameObjects.locationManagedByGameScene) {
      const { bodySprite, bodyPhysics, label } = this.gameObjects;
      if (!bodySprite.anims) return;
      bodySprite.setX(this.location.x);
      bodySprite.setY(this.location.y);
      if (this.location.moving) {
        bodySprite.anims.play(`misa-${this.location.rotation}-walk`, true);
        switch (this.location.rotation) {
          case 'front':
            bodyPhysics.setVelocity(0, MOVEMENT_SPEED);
            break;
          case 'right':
            bodyPhysics.setVelocity(MOVEMENT_SPEED, 0);
            break;
          case 'back':
            bodyPhysics.setVelocity(0, -MOVEMENT_SPEED);
            break;
          case 'left':
            bodyPhysics.setVelocity(-MOVEMENT_SPEED, 0);
            break;
        }
        bodyPhysics.velocity.normalize().scale(175);
      } else {
        bodyPhysics.setVelocity(0, 0);
        bodySprite.anims.stop();
        bodySprite.setTexture('atlas', `misa-${this.location.rotation}`); // change this soon
      }
      label.setX(bodyPhysics.x);
      label.setY(bodyPhysics.y - 20);
    }
  }

  static fromPlayerModel(modelPlayer: PlayerModel): PlayerController {
    return new PlayerController(modelPlayer.id, modelPlayer.userName, modelPlayer.location);
  }
}
