import * as PIXI from 'pixi.js';
import { ColorReplaceFilter } from './color-replace';
import { textures } from './images';
import { assembleSprites } from './dungeon-sprites';
import { PIPContainer } from './pip-container';
import { paletteColors, type PhantasyStar } from '@/map.interface';
import { getSlices } from './dungeon-patterns';
import { state } from '@/store';

const sprites = {
  mapLeft: {} as ReturnType<typeof assembleSprites>,
  mapRight: {} as ReturnType<typeof assembleSprites>
};

const samplePalette = {
  walls: [0x0000AA, 0x0055FF, 0x00AAFF, 0x00FFFF],
  floors: [0x005555, 0x55AA55, 0x55FF55, 0xAAFFAA]
};

export class DungeonView {
  public container: PIPContainer;
  private sprites: (PIXI.Sprite | PIXI.AnimatedSprite)[] = [];

  private colorReplaceFilters = {
    walls: samplePalette.walls.map(color => new ColorReplaceFilter(color, color, 0.0001)),
    floors: samplePalette.floors.map(color => new ColorReplaceFilter(color, color, 0.0001))
  };

  private animating = false;
  private customAnimation = false;
  private animationFrame = 0;
  private animationTick = 0;
  private animationInterval = 4;

  constructor(private app: PIXI.Application, parent?: PIXI.Container) {
    sprites.mapLeft = assembleSprites();
    sprites.mapRight = assembleSprites(sprite => sprite.scale.x = -1);

    this.container = new PIPContainer(app);
    (parent || app.stage).addChild(this.container);

    this.container.pipMode = 'pip';
    this.container.minZoom = 2;
    this.container.maxZoom = 5;
    this.container.pipZoom = 2;
    this.container.targetScale = 2;
    
    this.addSprite(textures.assets.dungeon['no-signal'].sprite);

    this.container.filters = [...this.colorReplaceFilters.walls, ...this.colorReplaceFilters.floors];
    
    this.container.pivot.x = this.container.width / 2;
    this.container.pivot.y = this.container.height / 2;

    this.resizeToFitScreen();
    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;

    this.updatePallete();

    app.ticker.add(() => this.update());

    window.addEventListener('keydown', e => {
      if (this.animating) return;

      switch (e.key) {
        case 'ArrowUp':
          this.moveCamera('forward');
          break;
        case 'ArrowDown':
          this.moveCamera('backward');
          break;
        case 'ArrowLeft':
          this.turnCamera('left');
          break;
        case 'ArrowRight':
          this.turnCamera('right');
          break;
      }
    });
  }

  public moveCamera(direction: 'forward' | 'backward') {
    const currentMap = state.dungeons[state.currentDungeon].floors[state.currentFloor].map;
    const dir = direction === 'forward' ? 1 : -1;

    const cellIsWalkable = (cell: PhantasyStar.MapCell) => {
      if (cell.type === 'open' || cell.type === 'chest' || cell.type === 'enemy') {
        return true;
      } else if (cell.type === 'npc' && cell.npcType === 'normal') {
        return true;
      } else if (cell.type === 'door') {
        const cellPastDoorX = state.selectedCell.x + (state.cameraDirection === 'east' ? (2 * dir) : (state.cameraDirection === 'west' ? (-2 * dir) : 0));
        const cellPastDoorY = state.selectedCell.y + (state.cameraDirection === 'south' ? (2 * dir) : (state.cameraDirection === 'north' ? (-2 * dir) : 0));
        return currentMap[cellPastDoorY][cellPastDoorX].type === 'open';
      }
    }

    let cellNextX = state.selectedCell.x + (state.cameraDirection === 'east' ? (1 * dir) : (state.cameraDirection === 'west' ? (-1 * dir) : 0));
    let cellNextY = state.selectedCell.y + (state.cameraDirection === 'south' ? (1 * dir) : (state.cameraDirection === 'north' ? (-1 * dir) : 0));
    const cellNext = currentMap[cellNextY][cellNextX];

    if (cellIsWalkable(cellNext)) {
      if (cellNext.type === 'door') {
        // add one more step to get past the door
        cellNextX = state.selectedCell.x + (state.cameraDirection === 'east' ? (2 * dir) : (state.cameraDirection === 'west' ? (-2 * dir) : 0));
        cellNextY = state.selectedCell.y + (state.cameraDirection === 'south' ? (2 * dir) : (state.cameraDirection === 'north' ? (-2 * dir) : 0));
      }
      
      state.selectedCell.x = cellNextX;
      state.selectedCell.y = cellNextY;
    }
  }

  public turnCamera(direction: 'left' | 'right') {
    switch (state.cameraDirection) {
      case 'north':
        state.cameraDirection = direction === 'left' ? 'west' : 'east';
        break;
      case 'east':
        state.cameraDirection = direction === 'left' ? 'north' : 'south';
        break;
      case 'south':
        state.cameraDirection = direction === 'left' ? 'east' : 'west';
        break;
      case 'west':
        state.cameraDirection = direction === 'left' ? 'south' : 'north';
        break;
    }
  }

  public resizeToFitScreen() {
    this.container.targetX = this.app.screen.width / 2;
    this.container.targetY = this.app.screen.height / 2;
    this.container.targetScale = 2;
  }

  public updatePallete() {
    const currentDungeon = state.dungeons[state.currentDungeon];
    const walls = currentDungeon.palettes.walls;
    const floors = currentDungeon.palettes.floors;

    const wallPallete = paletteColors[walls];
    const floorPallete = paletteColors[floors];

    wallPallete.floors.forEach((color, index) => {
      this.colorReplaceFilters.floors[index].newColor = color;
    });

    floorPallete.walls.forEach((color, index) => {
      this.colorReplaceFilters.walls[index].newColor = color;
    });
  }

  public triggerDungeonViewUpdate() {
    this.dumpSprites();

    if (state.selectedCell.x === -1 || state.selectedCell.y === -1 || !state.currentMapValid) {
      this.addSprite(textures.assets.dungeon['no-signal'].sprite);
      return;
    }

    const slices = getSlices();
    if (typeof slices === 'string') {
      switch (slices) {
        case 'WALL': this.addSprite(textures.assets.dungeon['wall'].sprite); break;
        case 'STAIRS_UP': this.addSprite(textures.assets.dungeon['stairs-up'].sprite); break;
        case 'STAIRS_DOWN': this.addSprite(textures.assets.dungeon['stairs-down'].sprite); break;
        case 'DOOR': this.addSprite(textures.assets.dungeon['door'].sprite); break;
        case 'MAGIC_DOOR': this.addSprite(textures.assets.dungeon['magic-door'].sprite); break;
        case 'DUNGEON_DOOR': this.addSprite(textures.assets.dungeon['dungeon-door'].sprite); break;
      }
    } else {
      slices.forEach(slice => {
        const [side, key, sequence, sliceIndex] = slice;
        switch (side) {
          case 'FULL':
            this.addSlice(key, sequence, sliceIndex);
            break;
          case 'LEFT':
            this.addSliceLeft(key, sequence, sliceIndex);
            break;
          case 'RIGHT':
            this.addSliceRight(key, sequence, sliceIndex);
            break;
        }
      });
    }
  }

  private addSprite(sprite: PIXI.Sprite) {
    this.sprites.push(sprite);
    this.container.addChild(sprite);
  }

  private addSlice(key: keyof typeof textures.assets, sequence: string, sliceIndex: number, framing: 'start' | 'end' = 'start') {
    const left = this.addSliceLeft(key, sequence, sliceIndex, framing);
    const right = this.addSliceRight(key, sequence, sliceIndex, framing);

    return { sprites: { left, right } };
  }

  private addSliceLeft(key: keyof typeof textures.assets, sequence: string, sliceIndex: number, framing: 'start' | 'end' = 'start', useRight = false) {
    const left = useRight ? sprites.mapRight[key][sequence][`${sliceIndex}`] : sprites.mapLeft[key][sequence][`${sliceIndex}`];
    this.addSprite(left);
    if (framing === 'end') left.gotoAndStop(left.totalFrames - 1);
    if (framing === 'start') left.gotoAndStop(0);

    switch (sliceIndex) {
      case 1:
        left.x = 0;
        break;
      case 2:
        left.x = 64;
        break;
      case 3:
        left.x = 88;
        break;
      case 4:
      default:
        left.x = 104;
        break;
    }

    return left;
  }

  private addSliceRight(key: keyof typeof textures.assets, sequence: string, sliceIndex: number, framing: 'start' | 'end' = 'start', useLeft = false) {
    const right = useLeft ? sprites.mapLeft[key][sequence][`${sliceIndex}`] : sprites.mapRight[key][sequence][`${sliceIndex}`];
    this.addSprite(right);
    if (framing === 'end') right.gotoAndStop(right.totalFrames - 1);
    if (framing === 'start') right.gotoAndStop(0);

    switch (sliceIndex) {
      case 1:
        right.x = 256;
        break;
      case 2:
        right.x = 192;
        break;
      case 3:
        right.x = 168;
        break;
      case 4:
      default:
        right.x = 152;
        break;
    }

    return right;
  }

  private dumpSprites() {
    this.sprites.forEach(sprite => this.container.removeChild(sprite));
    this.sprites = [];
    this.animating = false;
    this.customAnimation = false;
    this.animationFrame = 0;
    this.animationTick = 0;
  }

  private stopAnimation() {
    this.animating = false;
    this.customAnimation = false;
    this.animationFrame = 0;
    this.animationTick = 0;
  }

  private update() {
    this.container.update();

    if (this.animating && !this.customAnimation) {
      if (++this.animationTick >= this.animationInterval) {
        this.animationFrame++;
        this.animationTick = 0;
        if (this.animationFrame === 5) this.stopAnimation();
      }

      this.sprites.forEach(sprite => {
        if (sprite instanceof PIXI.AnimatedSprite) {
          sprite.gotoAndStop(this.animationFrame);
        }
      });
    }
  }
}