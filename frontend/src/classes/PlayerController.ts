import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import {
  Player as PlayerModel,
  PlayerLocation,
  PrototypePlayerGameObjects,
} from '../types/CoveyTownSocket';
// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore/lite';
import { firebaseConfig } from '../components/Login/Config';

export const MOVEMENT_SPEED = 175;

export type PlayerEvents = {
  movement: (newLocation: PlayerLocation) => void;
};

<<<<<<< Updated upstream
=======
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
  locationManagedByGameScene: boolean /* For the local player, the game scene will calculate the current location, and we should NOT apply updates when we receive events */;
};

>>>>>>> Stashed changes
export default class PlayerController extends (EventEmitter as new () => TypedEmitter<PlayerEvents>) {
  private _location: PlayerLocation;

  private readonly _id: string;

  private readonly _userName: string;

  public gameObjects?: PrototypePlayerGameObjects;

  // TODO: is this really an acceptable way to implement this?
  private static _app: FirebaseApp = initializeApp(firebaseConfig);

  constructor(
    id: string,
    userName: string,
    location: PlayerLocation,
    outfit?: PrototypePlayerGameObjects,
  ) {
    super();

    this._id = id;
    this._userName = userName;
    this._location = location;
    this.gameObjects = outfit;

    // Store player data to Firestore
    this._savePlayer();
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
   * @param file path of the image of the hair
   */
  set hair(newHair: string) {
    if (this.gameObjects === undefined) {
      throw new Error('No body detected');
    }
    const hairComponent = this.gameObjects.layer.getAt(0) as Phaser.Physics.Arcade.Sprite;
    hairComponent.setTexture(newHair);
  }

  /**
   * Sets the texture of the new outfit selected in the wardrobe.
   * @throws 'No body detected' if the game object of this player is undefined.
   * @param file path of the image of the outfit
   */
  set outfit(newOutfit: string) {
    if (this.gameObjects === undefined) {
      throw new Error('No body detected');
    }

    const outfitComponent = this.gameObjects.layer.getAt(1) as Phaser.Physics.Arcade.Sprite;
    outfitComponent.setTexture(newOutfit);
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  private async _getPlayer(id: string) {
    const db = getFirestore(PlayerController._app);
    const playersCol = collection(db, 'players');
    const playerSnapshot = await getDocs(playersCol);
    const players = playerSnapshot.docs.filter(doc => doc.id === id);
    if (players.length === 1) {
      console.log('Player id "', id, '" exists');
      return players[0];
    } else if (players.length > 1) {
      console.error('More than one player with id "', id, '" exists');
      return undefined;
    } else {
      console.log('Player id "', id, '" does not exist');
      return undefined;
    }
  }

  private async _savePlayer() {
    const db = getFirestore(PlayerController._app);
    const docRef = await addDoc(collection(db, 'players'), {
      id: this.id,
      userName: this.userName,
    });
    console.log('Document written with ID: ', docRef.id);
  }

  toPlayerModel(): PlayerModel {
    return { id: this.id, userName: this.userName, location: this.location };
  }

  private _updateGameComponentLocation() {
    if (this.gameObjects && !this.gameObjects.locationManagedByGameScene) {
      const { bodySprite, bodyPhysics, layer, label } = this.gameObjects;
      const hair = layer.getAt(0) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      const outfit = layer.getAt(1) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      if (!bodySprite.anims || !hair.anims || !outfit.anims) return;
      bodySprite.setX(this.location.x);
      bodySprite.setY(this.location.y);
      hair.setX(this.location.x);
      hair.setY(this.location.y);
      outfit.setX(this.location.x);
      outfit.setY(this.location.y);
      if (this.location.moving) {
        bodySprite.anims.play(`body-${this.location.rotation}-walk`, true);
        hair.anims.play('hair-${this.location.rotation}-walk', true);
        outfit.anims.play('dress-${this.location.rotation}-walk', true);
        switch (this.location.rotation) {
          case 'front':
            bodyPhysics.setVelocity(0, MOVEMENT_SPEED);
            hair.body.setVelocity(0, MOVEMENT_SPEED);
            outfit.body.setVelocity(0, MOVEMENT_SPEED);
            break;
          case 'right':
            bodyPhysics.setVelocity(MOVEMENT_SPEED, 0);
            hair.body.setVelocity(MOVEMENT_SPEED, 0);
            outfit.body.setVelocity(MOVEMENT_SPEED, 0);
            break;
          case 'back':
            bodyPhysics.setVelocity(0, -MOVEMENT_SPEED);
            hair.body.setVelocity(0, -MOVEMENT_SPEED);
            outfit.body.setVelocity(0, -MOVEMENT_SPEED);
            break;
          case 'left':
            bodyPhysics.setVelocity(-MOVEMENT_SPEED, 0);
            hair.body.setVelocity(-MOVEMENT_SPEED, 0);
            outfit.body.setVelocity(-MOVEMENT_SPEED, 0);
            break;
        }
        bodyPhysics.velocity.normalize().scale(175);
        hair.body.velocity.normalize().scale(175);
        outfit.body.velocity.normalize().scale(175);
      } else {
        bodyPhysics.setVelocity(0, 0);
        hair.body.setVelocity(0, 0);
        outfit.body.setVelocity(0, 0);
        bodySprite.anims.stop();
        hair.anims.stop();
        outfit.anims.stop();
        bodySprite.setTexture('bodyatlas', `body-${this.location.rotation}`);
        hair.setTexture('hairatlas', `hair-${this.location.rotation}`);
        outfit.setTexture('outfitatlas', `dress-${this.location.rotation}`);
      }
      label.setX(bodyPhysics.x);
      label.setY(bodyPhysics.y - 20);
    }
  }

  static fromPlayerModel(modelPlayer: PlayerModel): PlayerController {
    return new PlayerController(modelPlayer.id, modelPlayer.userName, modelPlayer.location);
  }
}
