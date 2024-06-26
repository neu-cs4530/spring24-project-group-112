import assert from 'assert';
import Phaser from 'phaser';
import PlayerController, { MOVEMENT_SPEED } from '../../classes/PlayerController';
import TownController from '../../classes/TownController';
import { PlayerLocation } from '../../types/CoveyTownSocket';
import { Callback } from '../VideoCall/VideoFrontend/types';
import Interactable from './Interactable';
import ConversationArea from './interactables/ConversationArea';
import GameArea from './interactables/GameArea';
import Transporter from './interactables/Transporter';
import ViewingArea from './interactables/ViewingArea';
import WardrobeArea from './interactables/WardrobeArea';

// Still not sure what the right type is here... "Interactable" doesn't do it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function interactableTypeForObjectType(type: string): any {
  if (type === 'ConversationArea') {
    return ConversationArea;
  } else if (type === 'Transporter') {
    return Transporter;
  } else if (type === 'ViewingArea') {
    return ViewingArea;
  } else if (type === 'GameArea') {
    return GameArea;
  } else if (type === 'WardrobeArea') {
    return WardrobeArea;
  } else {
    throw new Error(`Unknown object type: ${type}`);
  }
}

// Original inspiration and code from:
// https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
export default class TownGameScene extends Phaser.Scene {
  private _pendingOverlapExits = new Map<Interactable, () => void>();

  addOverlapExit(interactable: Interactable, callback: () => void) {
    this._pendingOverlapExits.set(interactable, callback);
  }

  private _players: PlayerController[] = [];

  private _interactables: Interactable[] = [];

  private _cursors: Phaser.Types.Input.Keyboard.CursorKeys[] = [];

  private _cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;

  /*
   * A "captured" key doesn't send events to the browser - they are trapped by Phaser
   * When pausing the game, we uncapture all keys, and when resuming, we re-capture them.
   * This is the list of keys that are currently captured by Phaser.
   */
  private _previouslyCapturedKeys: number[] = [];

  private _lastLocation?: PlayerLocation;

  private _ready = false;

  private _paused = false;

  public coveyTownController: TownController;

  private _onGameReadyListeners: Callback[] = [];

  /**
   * Layers that the player can collide with.
   */
  private _collidingLayers: Phaser.Tilemaps.TilemapLayer[] = [];

  private _gameIsReady = new Promise<void>(resolve => {
    if (this._ready) {
      resolve();
    } else {
      this._onGameReadyListeners.push(resolve);
    }
  });

  public get gameIsReady() {
    return this._gameIsReady;
  }

  public get cursorKeys() {
    const ret = this._cursorKeys;
    if (!ret) {
      throw new Error('Unable to access cursors before game scene is loaded');
    }
    return ret;
  }

  private _resourcePathPrefix: string;

  constructor(coveyTownController: TownController, resourcePathPrefix = '') {
    super('TownGameScene');
    this._resourcePathPrefix = resourcePathPrefix;
    this.coveyTownController = coveyTownController;
    this._players = this.coveyTownController.players;
  }

  preload() {
    this.load.image(
      'Room_Builder_32x32',
      this._resourcePathPrefix + '/assets/tilesets/Room_Builder_32x32.png',
    );
    this.load.image(
      '22_Museum_32x32',
      this._resourcePathPrefix + '/assets/tilesets/22_Museum_32x32.png',
    );
    this.load.image(
      '5_Classroom_and_library_32x32',
      this._resourcePathPrefix + '/assets/tilesets/5_Classroom_and_library_32x32.png',
    );
    this.load.image(
      '12_Kitchen_32x32',
      this._resourcePathPrefix + '/assets/tilesets/12_Kitchen_32x32.png',
    );
    this.load.image(
      '1_Generic_32x32',
      this._resourcePathPrefix + '/assets/tilesets/1_Generic_32x32.png',
    );
    this.load.image(
      '13_Conference_Hall_32x32',
      this._resourcePathPrefix + '/assets/tilesets/13_Conference_Hall_32x32.png',
    );
    this.load.image(
      '14_Basement_32x32',
      this._resourcePathPrefix + '/assets/tilesets/14_Basement_32x32.png',
    );
    this.load.image(
      '16_Grocery_store_32x32',
      this._resourcePathPrefix + '/assets/tilesets/16_Grocery_store_32x32.png',
    );
    this.load.tilemapTiledJSON('map', this._resourcePathPrefix + '/assets/tilemaps/indoors.json');
    // loading body atlases:
    this.load.atlas(
      'bodyatlas',
      this._resourcePathPrefix + '/assets/newatlas/body.png',
      this._resourcePathPrefix + '/assets/newatlas/body.json',
    );
    // loading hair atlases:
    this.load.atlas(
      'hairatlas',
      this._resourcePathPrefix + '/assets/newatlas/hair.png',
      this._resourcePathPrefix + '/assets/newatlas/hair.json',
    );
    this.load.atlas(
      'shorthairatlas',
      this._resourcePathPrefix + '/assets/newatlas/shorthair.png',
      this._resourcePathPrefix + '/assets/newatlas/shorthair.json',
    );
    // loading outfit atlases:
    this.load.atlas(
      'dressatlas',
      this._resourcePathPrefix + '/assets/newatlas/dress-outfit.png',
      this._resourcePathPrefix + 'assets/newatlas/dress-outfit.json',
    );
    this.load.atlas(
      'overallatlas',
      this._resourcePathPrefix + '/assets/newatlas/overall-outfit.png',
      this._resourcePathPrefix + 'assets/newatlas/overall-outfit.json',
    );
  }

  updatePlayers(players: PlayerController[]) {
    //Make sure that each player has sprites
    players.map(eachPlayer => this.createPlayerSprites(eachPlayer));

    // Remove disconnected players from board
    const disconnectedPlayers = this._players.filter(
      player => !players.find(p => p.id === player.id),
    );

    disconnectedPlayers.forEach(disconnectedPlayer => {
      if (disconnectedPlayer.gameObjects) {
        const { body, layer, label } = disconnectedPlayer.gameObjects;
        if (body && label && layer) {
          body.destroy();
          layer.destroy();
          label.destroy();
        }
      }
    });
    // Remove disconnected players from list
    this._players = players;
  }

  getNewMovementDirection() {
    if (this._cursors.find(keySet => keySet.left?.isDown)) {
      return 'left';
    }
    if (this._cursors.find(keySet => keySet.right?.isDown)) {
      return 'right';
    }
    if (this._cursors.find(keySet => keySet.down?.isDown)) {
      return 'front';
    }
    if (this._cursors.find(keySet => keySet.up?.isDown)) {
      return 'back';
    }
    return undefined;
  }

  moveOurPlayerTo(destination: Partial<PlayerLocation>) {
    const gameObjects = this.coveyTownController.ourPlayer.gameObjects;
    if (!gameObjects) {
      throw new Error('Unable to move player without game objects created first');
    }
    if (!this._lastLocation) {
      this._lastLocation = { moving: false, rotation: 'front', x: 0, y: 0 };
    }
    const hairSprite = gameObjects.layer.getAt(
      0,
    ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    const outfitSprite = gameObjects.layer.getAt(
      1,
    ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    if (destination.x !== undefined) {
      gameObjects.body.x = destination.x;
      hairSprite.x = destination.x;
      outfitSprite.x = destination.x;
      this._lastLocation.x = destination.x;
    }
    if (destination.y !== undefined) {
      gameObjects.body.y = destination.y;
      hairSprite.y = destination.y + 12;
      outfitSprite.y = destination.y + 10;
      this._lastLocation.y = destination.y;
    }
    if (destination.moving !== undefined) {
      this._lastLocation.moving = destination.moving;
    }
    if (destination.rotation !== undefined) {
      this._lastLocation.rotation = destination.rotation;
    }
    this.coveyTownController.emitMovement(this._lastLocation);
  }

  update() {
    if (this._paused) {
      return;
    }
    const player = this.coveyTownController.ourPlayer;
    const gameObjects = player.gameObjects;
    if (gameObjects && this._cursors) {
      const prevVelocity = gameObjects.body.body.velocity.clone();
      const hairSprite = gameObjects.layer.getAt(
        0,
      ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      const outfitSprite = gameObjects.layer.getAt(
        1,
      ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

      // Stop any previous movement from the last frame
      gameObjects.body.setVelocity(0);
      hairSprite.setVelocity(0);
      outfitSprite.setVelocity(0);

      const primaryDirection = this.getNewMovementDirection();

      switch (primaryDirection) {
        case 'left':
          gameObjects.body.setVelocityX(-MOVEMENT_SPEED);
          hairSprite.setVelocityX(-MOVEMENT_SPEED);
          outfitSprite.setVelocityX(-MOVEMENT_SPEED);
          gameObjects.body.anims.play(`${player.bodySelection.optionFrame}left-walk`, true);
          hairSprite.anims.play(`${player.hairSelection.optionFrame}left-walk`, true);
          outfitSprite.anims.play(`${player.outfitSelection.optionFrame}left-walk`, true);
          break;
        case 'right':
          gameObjects.body.setVelocityX(MOVEMENT_SPEED);
          hairSprite.setVelocityX(MOVEMENT_SPEED);
          outfitSprite.setVelocityX(MOVEMENT_SPEED);
          gameObjects.body.anims.play(`${player.bodySelection.optionFrame}right-walk`, true);
          hairSprite.anims.play(`${player.hairSelection.optionFrame}right-walk`, true);
          outfitSprite.anims.play(`${player.outfitSelection.optionFrame}right-walk`, true);
          break;
        case 'front':
          gameObjects.body.setVelocityY(MOVEMENT_SPEED);
          hairSprite.setVelocityY(MOVEMENT_SPEED);
          outfitSprite.setVelocityY(MOVEMENT_SPEED);
          gameObjects.body.anims.play(`${player.bodySelection.optionFrame}front-walk`, true);
          hairSprite.anims.play(`${player.hairSelection.optionFrame}front-walk`, true);
          outfitSprite.anims.play(`${player.outfitSelection.optionFrame}front-walk`, true);
          break;
        case 'back':
          gameObjects.body.setVelocityY(-MOVEMENT_SPEED);
          hairSprite.setVelocityY(-MOVEMENT_SPEED);
          outfitSprite.setVelocityY(-MOVEMENT_SPEED);
          gameObjects.body.anims.play(`${player.bodySelection.optionFrame}back-walk`, true);
          hairSprite.anims.play(`${player.hairSelection.optionFrame}back-walk`, true);
          outfitSprite.anims.play(`${player.outfitSelection.optionFrame}back-walk`, true);
          break;
        default:
          // Not moving
          gameObjects.body.anims.stop();
          hairSprite.anims.stop();
          outfitSprite.anims.stop();
          // If we were moving, pick and idle frame to use
          if (prevVelocity.x < 0) {
            gameObjects.body.setTexture(
              player.bodySelection.optionAtlas,
              `${player.bodySelection.optionFrame}left`,
            );
            hairSprite.setTexture(
              player.hairSelection.optionAtlas,
              `${player.hairSelection.optionFrame}left`,
            );
            outfitSprite.setTexture(
              player.outfitSelection.optionAtlas,
              `${player.outfitSelection.optionFrame}left`,
            );
          } else if (prevVelocity.x > 0) {
            gameObjects.body.setTexture(
              player.bodySelection.optionAtlas,
              `${player.bodySelection.optionFrame}right`,
            );
            hairSprite.setTexture(
              player.hairSelection.optionAtlas,
              `${player.hairSelection.optionFrame}right`,
            );
            outfitSprite.setTexture(
              player.outfitSelection.optionAtlas,
              `${player.outfitSelection.optionFrame}right`,
            );
          } else if (prevVelocity.y < 0) {
            gameObjects.body.setTexture(
              player.bodySelection.optionAtlas,
              `${player.bodySelection.optionFrame}back`,
            );
            hairSprite.setTexture(
              player.hairSelection.optionAtlas,
              `${player.hairSelection.optionFrame}back`,
            );
            outfitSprite.setTexture(
              player.outfitSelection.optionAtlas,
              `${player.outfitSelection.optionFrame}back`,
            );
          } else if (prevVelocity.y > 0) {
            gameObjects.body.setTexture(
              player.bodySelection.optionAtlas,
              `${player.bodySelection.optionFrame}front`,
            );
            hairSprite.setTexture(
              player.hairSelection.optionAtlas,
              `${player.hairSelection.optionFrame}front`,
            );
            outfitSprite.setTexture(
              player.outfitSelection.optionAtlas,
              `${player.outfitSelection.optionFrame}front`,
            );
          }
          break;
      }

      // Normalize and scale the velocity so that player can't move faster along a diagonal
      gameObjects.body.body.velocity.normalize().scale(MOVEMENT_SPEED);
      hairSprite.body.velocity.normalize().scale(MOVEMENT_SPEED);
      outfitSprite.body.velocity.normalize().scale(MOVEMENT_SPEED);
      const isMoving = primaryDirection !== undefined;

      const x = gameObjects.body.getBounds().centerX;
      const y = gameObjects.body.getBounds().centerY;

      hairSprite.copyPosition(gameObjects.body);
      outfitSprite.copyPosition(gameObjects.body);
      hairSprite.y -= 10;
      outfitSprite.y += 10;

      //Move the sprite
      if (
        !this._lastLocation ||
        (isMoving && this._lastLocation.rotation !== primaryDirection) ||
        this._lastLocation.moving !== isMoving
      ) {
        if (!this._lastLocation) {
          this._lastLocation = {
            x,
            y,
            rotation: primaryDirection || 'front',
            moving: isMoving,
          };
        }
        this._lastLocation.x = x;
        this._lastLocation.y = y;
        this._lastLocation.rotation = primaryDirection || this._lastLocation.rotation || 'front';
        this._lastLocation.moving = isMoving;
        this._pendingOverlapExits.forEach((cb, interactable) => {
          const hair = gameObjects.layer.getAt(
            0,
          ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
          const outfit = gameObjects.layer.getAt(
            1,
          ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
          if (
            !Phaser.Geom.Rectangle.Overlaps(
              interactable.getBounds(),
              gameObjects.body.getBounds(),
            ) ||
            !Phaser.Geom.Rectangle.Overlaps(interactable.getBounds(), hair.getBounds()) ||
            !Phaser.Geom.Rectangle.Overlaps(interactable.getBounds(), outfit.getBounds())
          ) {
            this._pendingOverlapExits.delete(interactable);
            cb();
          }
        });
        this.coveyTownController.emitMovement(this._lastLocation);
      }

      //Update the location for the labels of all of the other players
      for (const playerEntity of this._players) {
        if (playerEntity.gameObjects?.label && playerEntity.gameObjects?.body) {
          playerEntity.gameObjects.label.setX(playerEntity.gameObjects.body.x + 10);
          playerEntity.gameObjects.label.setY(playerEntity.gameObjects.body.y - 30);
        }
      }
    }
  }

  private _map?: Phaser.Tilemaps.Tilemap;

  public get map(): Phaser.Tilemaps.Tilemap {
    const map = this._map;
    if (!map) {
      throw new Error('Cannot access map before it is initialized');
    }
    return map;
  }

  getInteractables(): Interactable[] {
    const typedObjects = this.map.filterObjects('Objects', obj => obj.type !== '');
    assert(typedObjects);
    const gameObjects = this.map.createFromObjects(
      'Objects',
      typedObjects.map(obj => ({
        id: obj.id,
        classType: interactableTypeForObjectType(obj.type),
      })),
    );

    return gameObjects as Interactable[];
  }

  create() {
    this._map = this.make.tilemap({ key: 'map' });

    /* Parameters are the name you gave the tileset in Tiled and then the key of the
         tileset image in Phaser's cache (i.e. the name you used in preload)
         */
    const tileset = [
      'Room_Builder_32x32',
      '22_Museum_32x32',
      '5_Classroom_and_library_32x32',
      '12_Kitchen_32x32',
      '1_Generic_32x32',
      '13_Conference_Hall_32x32',
      '14_Basement_32x32',
      '16_Grocery_store_32x32',
    ].map(v => {
      const ret = this.map.addTilesetImage(v);
      assert(ret);
      return ret;
    });

    this._collidingLayers = [];
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = this.map.createLayer('Below Player', tileset, 0, 0);
    assert(belowLayer);
    belowLayer.setDepth(-10);
    const wallsLayer = this.map.createLayer('Walls', tileset, 0, 0);
    const onTheWallsLayer = this.map.createLayer('On The Walls', tileset, 0, 0);
    assert(wallsLayer);
    assert(onTheWallsLayer);
    wallsLayer.setCollisionByProperty({ collides: true });
    onTheWallsLayer.setCollisionByProperty({ collides: true });

    const worldLayer = this.map.createLayer('World', tileset, 0, 0);
    assert(worldLayer);
    worldLayer.setCollisionByProperty({ collides: true });
    const aboveLayer = this.map.createLayer('Above Player', tileset, 0, 0);
    assert(aboveLayer);
    aboveLayer.setCollisionByProperty({ collides: true });

    const veryAboveLayer = this.map.createLayer('Very Above Player', tileset, 0, 0);
    assert(veryAboveLayer);
    /* By default, everything gets depth sorted on the screen in the order we created things.
         Here, we want the "Above Player" layer to sit on top of the player, so we explicitly give
         it a depth. Higher depths will sit on top of lower depth objects.
         */
    worldLayer.setDepth(5);
    aboveLayer.setDepth(10);
    veryAboveLayer.setDepth(15);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    const spawnPoint = this.map.findObject(
      'Objects',
      obj => obj.name === 'Spawn Point',
    ) as unknown as Phaser.GameObjects.Components.Transform;

    const labels = this.map.filterObjects('Objects', obj => obj.name === 'label');
    labels?.forEach(label => {
      if (label.x && label.y) {
        this.add.text(label.x, label.y, label.text.text, {
          color: '#FFFFFF',
          backgroundColor: '#000000',
        });
      }
    });
    assert(this.input.keyboard);
    this._cursorKeys = this.input.keyboard.createCursorKeys();
    this._cursors.push(this._cursorKeys);
    this._cursors.push(
      this.input.keyboard.addKeys(
        {
          up: Phaser.Input.Keyboard.KeyCodes.W,
          down: Phaser.Input.Keyboard.KeyCodes.S,
          left: Phaser.Input.Keyboard.KeyCodes.A,
          right: Phaser.Input.Keyboard.KeyCodes.D,
        },
        false,
      ) as Phaser.Types.Input.Keyboard.CursorKeys,
    );
    this._cursors.push(
      this.input.keyboard.addKeys(
        {
          up: Phaser.Input.Keyboard.KeyCodes.H,
          down: Phaser.Input.Keyboard.KeyCodes.J,
          left: Phaser.Input.Keyboard.KeyCodes.K,
          right: Phaser.Input.Keyboard.KeyCodes.L,
        },
        false,
      ) as Phaser.Types.Input.Keyboard.CursorKeys,
    );

    // Create a sprite with physics enabled via the physics system. The image used for the sprite
    // has a bit of whitespace, so I'm using setSize & setOffset to control the size of the
    // player's body.

    const player = this.coveyTownController.ourPlayer;
    const body = this.physics.add
      .sprite(
        spawnPoint.x,
        spawnPoint.y,
        player.bodySelection.optionAtlas,
        `${player.bodySelection.optionFrame}front`,
      )
      .setBodySize(30, 40)
      .setDepth(6);
    const hairSprite = this.physics.add
      .sprite(
        spawnPoint.x,
        spawnPoint.y - 10,
        player.hairSelection.optionAtlas,
        `${player.hairSelection.optionFrame}front`,
      )
      .setSize(32, 26);
    const outfitSprite = this.physics.add
      .sprite(
        spawnPoint.x,
        spawnPoint.y + 10,
        player.outfitSelection.optionAtlas,
        `${player.outfitSelection.optionFrame}front`,
      )
      .setSize(20, 14);
    const layer = this.add.layer().setDepth(7);
    layer.add(hairSprite);
    layer.add(outfitSprite);

    const label = this.add
      .text(spawnPoint.x + 10, spawnPoint.y - 30, '(You)', {
        font: '18px monospace',
        color: '#000000',
        // padding: {x: 20, y: 10},
        backgroundColor: '#ffffff',
      })
      .setDepth(6);

    // Where info is saved to player controller
    this.coveyTownController.ourPlayer.gameObjects = {
      body,
      layer,
      label,
      locationManagedByGameScene: true,
    };

    this._interactables = this.getInteractables();

    this.moveOurPlayerTo({ rotation: 'front', moving: false, x: spawnPoint.x, y: spawnPoint.y });

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    this._collidingLayers.push(worldLayer);
    this._collidingLayers.push(wallsLayer);
    this._collidingLayers.push(aboveLayer);
    this._collidingLayers.push(onTheWallsLayer);
    this._collidingLayers.forEach(collidingLayer =>
      this.physics.add.collider(body, collidingLayer),
    );
    this._collidingLayers.forEach(collidingLayer =>
      this.physics.add.collider(hairSprite, collidingLayer),
    );
    this._collidingLayers.forEach(collidingLayer =>
      this.physics.add.collider(outfitSprite, collidingLayer),
    );

    // Create the player's walking animations from the texture atlas. These are stored in the global
    // animation manager so any sprite can access them.
    // Body animations:
    const { anims } = this;
    anims.create({
      key: 'body-left-walk',
      frames: anims.generateFrameNames('bodyatlas', {
        prefix: 'body-left-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'body-right-walk',
      frames: anims.generateFrameNames('bodyatlas', {
        prefix: 'body-right-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'body-front-walk',
      frames: anims.generateFrameNames('bodyatlas', {
        prefix: 'body-front-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'body-back-walk',
      frames: anims.generateFrameNames('bodyatlas', {
        prefix: 'body-back-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Hair animations:
    this.anims.create({
      key: 'hair-back-walk',
      frames: this.anims.generateFrameNames('hairatlas', {
        prefix: 'hair-back-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'hair-front-walk',
      frames: this.anims.generateFrameNames('hairatlas', {
        prefix: 'hair-front-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'hair-right-walk',
      frames: this.anims.generateFrameNames('hairatlas', {
        prefix: 'hair-right-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'hair-left-walk',
      frames: this.anims.generateFrameNames('hairatlas', {
        prefix: 'hair-left-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'shorthair-back-walk',
      frames: this.anims.generateFrameNames('shorthairatlas', {
        prefix: 'shorthair-back-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'shorthair-front-walk',
      frames: this.anims.generateFrameNames('shorthairatlas', {
        prefix: 'shorthair-front-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'shorthair-right-walk',
      frames: this.anims.generateFrameNames('shorthairatlas', {
        prefix: 'shorthair-right-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'shorthair-left-walk',
      frames: this.anims.generateFrameNames('shorthairatlas', {
        prefix: 'shorthair-left-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Outfit animations:
    this.anims.create({
      key: 'dress-back-walk',
      frames: this.anims.generateFrameNames('dressatlas', {
        prefix: 'dress-back-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'dress-front-walk',
      frames: this.anims.generateFrameNames('dressatlas', {
        prefix: 'dress-front-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'dress-right-walk',
      frames: this.anims.generateFrameNames('dressatlas', {
        prefix: 'dress-right-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'dress-left-walk',
      frames: this.anims.generateFrameNames('dressatlas', {
        prefix: 'dress-left-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'overall-back-walk',
      frames: this.anims.generateFrameNames('overallatlas', {
        prefix: 'overall-back-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'overall-front-walk',
      frames: this.anims.generateFrameNames('overallatlas', {
        prefix: 'overall-front-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'overall-right-walk',
      frames: this.anims.generateFrameNames('overallatlas', {
        prefix: 'overall-right-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'overall-left-walk',
      frames: this.anims.generateFrameNames('overallatlas', {
        prefix: 'overall-left-walk.',
        start: 0,
        end: 7,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    const camera = this.cameras.main;
    camera.startFollow(this.coveyTownController.ourPlayer.gameObjects.body);
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, `Arrow keys to move`, {
        font: '18px monospace',
        color: '#000000',
        padding: {
          x: 20,
          y: 10,
        },
        backgroundColor: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(30);

    this._ready = true;
    this.updatePlayers(this.coveyTownController.players);
    // Call any listeners that are waiting for the game to be initialized
    this._onGameReadyListeners.forEach(listener => listener());
    this._onGameReadyListeners = [];
    this.coveyTownController.addListener('playersChanged', players => this.updatePlayers(players));
  }

  createPlayerSprites(player: PlayerController) {
    if (!player.gameObjects) {
      const body = this.physics.add
        .sprite(
          player.location.x,
          player.location.y,
          player.bodySelection.optionAtlas,
          `${player.bodySelection.optionFrame}front`,
        )
        .setSize(30, 40)
        .setDepth(6);

      const hairSprite = this.physics.add.sprite(
        player.location.x,
        player.location.y - 10,
        player.hairSelection.optionAtlas,
        `${player.hairSelection.optionFrame}front`,
      );
      const outfitSprite = this.physics.add.sprite(
        player.location.x,
        player.location.y + 10,
        player.outfitSelection.optionAtlas,
        `${player.outfitSelection.optionFrame}front`,
      );
      const layer = this.add.layer().setDepth(7);
      layer.add(hairSprite);
      layer.add(outfitSprite);

      const label = this.add.text(
        player.location.x + 10,
        player.location.y - 30,
        player === this.coveyTownController.ourPlayer ? '(You)' : player.userName,
        {
          font: '18px monospace',
          color: '#000000',
          // padding: {x: 20, y: 10},
          backgroundColor: '#ffffff',
        },
      );
      player.gameObjects = {
        body,
        layer,
        label,
        locationManagedByGameScene: true,
      };
      this._collidingLayers.forEach(collidingLayer =>
        this.physics.add.collider(body, collidingLayer),
      );
      this._collidingLayers.forEach(collidingLayer =>
        this.physics.add.collider(hairSprite, collidingLayer),
      );
      this._collidingLayers.forEach(collidingLayer =>
        this.physics.add.collider(outfitSprite, collidingLayer),
      );
    }
  }

  pause() {
    if (!this._paused) {
      this._paused = true;
      const gameObjects = this.coveyTownController.ourPlayer.gameObjects;
      if (gameObjects) {
        gameObjects.body.anims.stop();
        gameObjects.body.setVelocity(0);
      }
      assert(this.input.keyboard);
      this._previouslyCapturedKeys = this.input.keyboard.getCaptures();
      this.input.keyboard.clearCaptures();
    }
  }

  resume() {
    if (this._paused) {
      this._paused = false;
      if (this.input && this.input.keyboard) {
        this.input.keyboard.addCapture(this._previouslyCapturedKeys);
      }
      this._previouslyCapturedKeys = [];
    }
  }
}
