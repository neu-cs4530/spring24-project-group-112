import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import {
  Player as PlayerModel,
  PlayerLocation,
  PrototypePlayerGameObjects,
} from '../types/CoveyTownSocket';
// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from 'firebase/app';
import { firebaseConfig } from '../components/Login/Config';
import { getFirestore, doc, getDoc, addDoc, collection } from 'firebase/firestore';

export const MOVEMENT_SPEED = 175;

export type PlayerEvents = {
  movement: (newLocation: PlayerLocation) => void;
};

// "List" of the values that we want saved to the database.
type SaveablePlayerValues = {
  id: string;
  userName: string;
};

export default class PlayerController extends (EventEmitter as new () => TypedEmitter<PlayerEvents>) {
  private _location: PlayerLocation;

  private readonly _id: string;

  private readonly _userName: string;

  public gameObjects?: PrototypePlayerGameObjects;

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

  // Retrieve the details of the given player id from the firestore database.
  private static async _getPlayer(id: string) {
    const db = getFirestore(PlayerController._app);
    const docRef = doc(db, 'accounts', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.error('No player data found!');
      return undefined;
    }
  }

  // Save the current PlayerController details to the firestore database.
  public async _savePlayer() {
    const db = getFirestore(PlayerController._app);
    const colRef = collection(db, `accounts`);
    // With this casting choice, we can ensure that this function will alert us if we forget to update it
    // after updating the SaveablePlayerValues type.
    const docRef = await addDoc(colRef, {
      id: this.id,
      userName: this.userName,
      location: this.location,
    } as SaveablePlayerValues);

    console.log('Document written with ID: ', docRef.id);
  }

  toPlayerModel(): PlayerModel {
    return { id: this.id, userName: this.userName, location: this.location };
  }

  private _updateGameComponentLocation() {
    if (this.gameObjects && !this.gameObjects.locationManagedByGameScene) {
      const { body, layer, label } = this.gameObjects;
      const hair = layer.getAt(0) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      const outfit = layer.getAt(1) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      if (!body.sprite.anims || !hair.anims || !outfit.anims) return;
      body.setX(this.location.x);
      body.setY(this.location.y);
      hair.setX(this.location.x);
      hair.setY(this.location.y - 10);
      outfit.setX(this.location.x);
      outfit.setY(this.location.y + 10);
      if (this.location.moving) {
        body.anims.play(`body-${this.location.rotation}-walk`, true);
        hair.anims.play('hair-${this.location.rotation}-walk', true);
        outfit.anims.play('dress-${this.location.rotation}-walk', true);
        switch (this.location.rotation) {
          case 'front':
            body.body.setVelocity(0, MOVEMENT_SPEED);
            hair.body.setVelocity(0, MOVEMENT_SPEED);
            outfit.body.setVelocity(0, MOVEMENT_SPEED);
            break;
          case 'right':
            body.body.setVelocity(MOVEMENT_SPEED, 0);
            hair.body.setVelocity(MOVEMENT_SPEED, 0);
            outfit.body.setVelocity(MOVEMENT_SPEED, 0);
            break;
          case 'back':
            body.body.setVelocity(0, -MOVEMENT_SPEED);
            hair.body.setVelocity(0, -MOVEMENT_SPEED);
            outfit.body.setVelocity(0, -MOVEMENT_SPEED);
            break;
          case 'left':
            body.body.setVelocity(-MOVEMENT_SPEED, 0);
            hair.body.setVelocity(-MOVEMENT_SPEED, 0);
            outfit.body.setVelocity(-MOVEMENT_SPEED, 0);
            break;
        }
        body.body.velocity.normalize().scale(175);
        hair.body.velocity.normalize().scale(175);
        outfit.body.velocity.normalize().scale(175);
      } else {
        body.body.setVelocity(0, 0);
        hair.body.setVelocity(0, 0);
        outfit.body.setVelocity(0, 0);
        body.anims.stop();
        hair.anims.stop();
        outfit.anims.stop();
        body.setTexture('bodyatlas', `body-${this.location.rotation}`);
        hair.setTexture('hairatlas', `hair-${this.location.rotation}`);
        outfit.setTexture('outfitatlas', `dress-${this.location.rotation}`);
      }
      label.setX(body.x);
      label.setY(body.y - 20);
    }
  }

  static async fromPlayerModel(modelPlayer: PlayerModel): Promise<PlayerController> {
    const playerData = await this._getPlayer(modelPlayer.id);
    // From here, the playerData is the information on the database. You can use it to modify the player.
    // prior to returning them.
    const ret = new PlayerController(modelPlayer.id, modelPlayer.userName, modelPlayer.location);

    return ret;
  }
}
