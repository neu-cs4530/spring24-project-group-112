import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import {
  Player as PlayerModel,
  PlayerLocation,
  PrototypePlayerGameObjects,
  HairOption,
  OutfitOption,
  BodyOption,
} from '../types/CoveyTownSocket';
// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from 'firebase/app';
import { firebaseConfig } from '../components/Login/Config';
import { getFirestore, doc, getDoc, addDoc, collection, DocumentData } from 'firebase/firestore';

export const MOVEMENT_SPEED = 175;

export type PlayerEvents = {
  movement: (newLocation: PlayerLocation) => void;
};

export default class PlayerController extends (EventEmitter as new () => TypedEmitter<PlayerEvents>) {
  private _location: PlayerLocation;

  private readonly _id: string;

  private readonly _userName: string;

  public gameObjects?: PrototypePlayerGameObjects;

  private _bodySelection: BodyOption;

  private _hairSelection: HairOption;

  private _outfitSelection: OutfitOption;

  private static _app: FirebaseApp = initializeApp(firebaseConfig);

  constructor(
    id: string,
    userName: string,
    location: PlayerLocation,
    body?: BodyOption,
    hair?: HairOption,
    outfit?: OutfitOption,
  ) {
    super();
    this._id = id;
    this._userName = userName;
    this._location = location;

    // when first constructed, all player controllers are set with default values.
    this._bodySelection =
      body === undefined ? { optionID: 0, optionAtlas: 'bodyatlas', optionFrame: 'body-' } : body;
    this._hairSelection =
      hair === undefined ? { optionID: 0, optionAtlas: 'hairatlas', optionFrame: 'hair-' } : hair;
    this._outfitSelection =
      outfit === undefined
        ? { optionID: 0, optionAtlas: 'dressatlas', optionFrame: 'dress-' }
        : outfit;
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
   * The original selection for hair is automatically updated with the new hair.
   * @throws 'No body detected' if the game object of this player is undefined.
   * @param file path of the image of the hair
   */
  set hairSelection(newHair: HairOption) {
    if (this.gameObjects === undefined) {
      throw new Error('No body detected');
    }
    const hairComponent = this.gameObjects.layer.getAt(0) as Phaser.Physics.Arcade.Sprite;
    hairComponent.setTexture(
      newHair.optionAtlas,
      `${newHair.optionFrame}${this.location.rotation}`,
    );
    this._hairSelection = newHair;
    console.log('player hair set to: ', newHair);
  }

  /**
   * Sets the texture of the new outfit selected in the wardrobe.
   * The original selection for outfit is automatically updated with the new outfit.
   * @throws 'No body detected' if the game object of this player is undefined.
   * @param file path of the image of the outfit
   */
  set outfitSelection(newOutfit: OutfitOption) {
    if (this.gameObjects === undefined) {
      throw new Error('No body detected');
    }

    const outfitComponent = this.gameObjects.layer.getAt(1) as Phaser.Physics.Arcade.Sprite;
    outfitComponent.setTexture(
      newOutfit.optionAtlas,
      `${newOutfit.optionFrame}${this.location.rotation}`,
    );
    console.log('player outfit set to: ', newOutfit);
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  get bodySelection(): BodyOption {
    return this._bodySelection;
  }

  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
  get hairSelection(): HairOption {
    return this._hairSelection;
  }

  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
  get outfitSelection(): OutfitOption {
    return this._outfitSelection;
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
  public async savePlayer() {
    const db = getFirestore(PlayerController._app);
    const colRef = collection(db, `accounts`);
    const docRef = await addDoc(colRef, {
      id: this.id,
      userName: this.userName,
      body: [
        this.bodySelection.optionID,
        this.bodySelection.optionAtlas,
        this.bodySelection.optionFrame,
      ],
      hair: [
        this.hairSelection.optionID,
        this.hairSelection.optionAtlas,
        this.hairSelection.optionFrame,
      ],
      outfit: [
        this.outfitSelection.optionID,
        this.outfitSelection.optionAtlas,
        this.outfitSelection.optionFrame,
      ],
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
        body.anims.play(`${this._bodySelection.optionFrame}${this.location.rotation}-walk`, true);
        hair.anims.play(`${this._hairSelection.optionFrame}${this.location.rotation}-walk`, true);
        outfit.anims.play(
          `${this._outfitSelection.optionFrame}${this.location.rotation}-walk`,
          true,
        );
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
        body.setTexture(
          this._bodySelection.optionAtlas,
          `${this._bodySelection.optionFrame}${this.location.rotation}`,
        );
        hair.setTexture(
          this._hairSelection.optionAtlas,
          `${this._hairSelection.optionFrame}${this.location.rotation}`,
        );
        outfit.setTexture(
          this._outfitSelection.optionAtlas,
          `${this._outfitSelection.optionFrame}${this.location.rotation}`,
        );
      }
      label.setX(body.x + 10);
      label.setY(body.y - 30);
    }
  }

  static async fromPlayerModel(modelPlayer: PlayerModel): Promise<PlayerController> {
    const playerData = await this._getPlayer(modelPlayer.id);
    console.log('playerData:', playerData);
    // From here, the playerData is the information on the database. You can use it to modify the player.
    // prior to returning them.

    let bodyOption: BodyOption | undefined = undefined;
    let hairOption: HairOption | undefined = undefined;
    let outfitOption: OutfitOption | undefined = undefined;
    // check for outfit options in playerData
    if (playerData !== undefined) {
      if (playerData.outfit !== undefined) {
        outfitOption = {
          optionID: playerData.outfit[0],
          optionAtlas: playerData.outfit[1],
          optionFrame: playerData.outfit[2],
        } as OutfitOption;
      }
      if (playerData.hair !== undefined) {
        hairOption = {
          optionID: playerData.hair[0],
          optionAtlas: playerData.hair[1],
          optionFrame: playerData.hair[2],
        } as HairOption;
      }
      if (playerData.body !== undefined) {
        bodyOption = {
          optionID: playerData.body[0],
          optionAtlas: playerData.body[1],
          optionFrame: playerData.body[2],
        } as BodyOption;
      }
    }
    const ret = new PlayerController(
      modelPlayer.id,
      modelPlayer.userName,
      modelPlayer.location,
      bodyOption,
      hairOption,
      outfitOption,
    );

    return ret;
  }
}
