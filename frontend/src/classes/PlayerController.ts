import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { Player as PlayerModel, PlayerLocation } from '../types/CoveyTownSocket';
// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore/lite';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: 'AIzaSyDsXaSPKpBQNG0rielahA9jt-YSVzLnmsc',
  authDomain: 'coveytest-50d56.firebaseapp.com',
  projectId: 'coveytest-50d56',
  storageBucket: 'coveytest-50d56.appspot.com',
  messagingSenderId: '131579696929',
  appId: '1:131579696929:web:e6b4acc60fb56faee29060',
};

export const MOVEMENT_SPEED = 175;

export type PlayerEvents = {
  movement: (newLocation: PlayerLocation) => void;
};

export type PlayerGameObjects = {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  label: Phaser.GameObjects.Text;
  locationManagedByGameScene: boolean /* For the local player, the game scene will calculate the current location, and we should NOT apply updates when we receive events */;
};

export default class PlayerController extends (EventEmitter as new () => TypedEmitter<PlayerEvents>) {
  private _location: PlayerLocation;

  private readonly _id: string;

  private readonly _userName: string;

  public gameObjects?: PlayerGameObjects;

  private static _app: FirebaseApp = initializeApp(firebaseConfig);

  constructor(id: string, userName: string, location: PlayerLocation) {
    super();

    this._id = id;
    this._userName = userName;
    this._location = location;

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
      const { sprite, label } = this.gameObjects;
      if (!sprite.anims) return;
      sprite.setX(this.location.x);
      sprite.setY(this.location.y);
      if (this.location.moving) {
        sprite.anims.play(`misa-${this.location.rotation}-walk`, true);
        switch (this.location.rotation) {
          case 'front':
            sprite.body.setVelocity(0, MOVEMENT_SPEED);
            break;
          case 'right':
            sprite.body.setVelocity(MOVEMENT_SPEED, 0);
            break;
          case 'back':
            sprite.body.setVelocity(0, -MOVEMENT_SPEED);
            break;
          case 'left':
            sprite.body.setVelocity(-MOVEMENT_SPEED, 0);
            break;
        }
        sprite.body.velocity.normalize().scale(175);
      } else {
        sprite.body.setVelocity(0, 0);
        sprite.anims.stop();
        sprite.setTexture('atlas', `misa-${this.location.rotation}`);
      }
      label.setX(sprite.body.x);
      label.setY(sprite.body.y - 20);
    }
  }

  static fromPlayerModel(modelPlayer: PlayerModel): PlayerController {
    return new PlayerController(modelPlayer.id, modelPlayer.userName, modelPlayer.location);
  }
}
