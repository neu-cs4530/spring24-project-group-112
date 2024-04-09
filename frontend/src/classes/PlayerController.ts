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
    console.log('player hair set to: ', newHair);
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
    console.log('player outfit set to: ', newOutfit);
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  private static async _init(PID: string) {
    const player = await this._getPlayer(PID);
    if (player) {
      console.log('Player id "', this.id, '" exists');
    }
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
    const docRef = await addDoc(collection(db, 'accounts'), {
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
        hair.anims.play(`hair-${this.location.rotation}-walk`, true);
        outfit.anims.play(`dress-${this.location.rotation}-walk`, true);
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
    // const fbReturn = await this._init();
    const ret = new PlayerController(modelPlayer.id, modelPlayer.userName, modelPlayer.location);

    return ret;
  }
}
