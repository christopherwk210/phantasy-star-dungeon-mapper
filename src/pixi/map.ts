import * as PIXI from 'pixi.js';
import { state, getCell, getCellBatch, getCellBatchRow } from '@/store';
import { PIPContainer } from './pip-container';
import { textures } from './images';

const gridSize = 14;
const floorColor = 0xFFFFFF;
const wallColor = 0x404054;
const invalidCellColor = 0xDC3545;

const gridColor = 0x027BD3;
const gridAlpha = 1;

interface GridCell {
  cells: {
    wall: PIXI.Graphics;
    floor: PIXI.Graphics;
    invalid: PIXI.Graphics;
  };
  elements: {
    chest: PIXI.Sprite;
    door: PIXI.Sprite;
    'dungeon-door': PIXI.Sprite;
    enemy: PIXI.Sprite;
    'illusory-wall': PIXI.Sprite;
    'magic-door': PIXI.Sprite;
    npc: PIXI.Sprite;
    'stairs-down': PIXI.Sprite;
    'stairs-up': PIXI.Sprite;
    'trap-landing': PIXI.Sprite;
    trap: PIXI.Sprite;
  };
  x: number;
  y: number;
  open: boolean;
  invalid: boolean;
  selected: boolean;
}

export class Map {
  public container: PIPContainer;
  private cells: GridCell[] = [];
  private verticalLines: PIXI.Graphics[] = [];
  private horizontalLines: PIXI.Graphics[] = [];
  private totalLines = gridSize;

  private changeCameraOnOpen = false;

  private selectedCellOutline: PIXI.Graphics = new PIXI.Graphics();
  private selectedCellArrow: PIXI.Sprite = textures.assets.dungeon['arrow'].sprite;
  private contextCell: PIXI.AnimatedSprite;

  private isPainting = false;
  private paintingMode: 'open' | 'floor' = 'floor';

  private gridVisible = true;

  constructor(private app: PIXI.Application, parent?: PIXI.Container) {
    this.container = new PIPContainer(app);
    (parent || app.stage).addChild(this.container);

    this.selectedCellArrow.pivot.x = this.selectedCellArrow.width / 2;
    this.selectedCellArrow.pivot.y = this.selectedCellArrow.height / 2;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const { wallCell, floorCell, invalidCell, elements } = this.createCell();
        const gridCell: GridCell = {
          cells: {
            wall: wallCell,
            floor: floorCell,
            invalid: invalidCell
          },
          elements,
          x,
          y,
          open: false,
          invalid: false,
          selected: false
        }
        this.cells.push(gridCell);
        [wallCell, floorCell, invalidCell].forEach((cell, index) => {
          cell.x = (x * 32);
          cell.y = (y * 32);
          cell.eventMode = 'static';
          cell.addEventListener('pointerdown', e => {
            if (e.button === 0) {
              if (e.ctrlKey) {
                if (gridCell.open) {
                  if (state.selectedCell.x === x && state.selectedCell.y === y) {
                    state.selectedCell.x = -1;
                    state.selectedCell.y = -1;
                  } else {
                    state.selectedCell.x = x;
                    state.selectedCell.y = y;
                  }
                }
              } else if (e.shiftKey) {
                state.contextCell.visible = false;
                if (state.contextCell.x === x && state.contextCell.y === y && state.contextCell.selected) {
                  state.contextCell.selected = false;
                } else {
                  state.contextCell.selected = true;
                  state.contextCell.x = x;
                  state.contextCell.y = y;
                }
              } else {
                this.cellClicked(gridCell, x, y);
              }
            }
            if (e.button === 2) this.cellRightClicked(gridCell, x, y);
          });
          cell.addEventListener('pointermove', e => {
            this.cellHovered(gridCell, x, y);
          });
          if (index > 0) cell.visible = false;
          this.container.addChild(cell);
        });

        for (const key in elements) {
          elements[key].x = (x * 32) + 16;
          elements[key].y = (y * 32) + 16;
          this.container.addChild(elements[key]);
        }
      }
    }
    this.contextCell = this.createContextCellSprite();

    this.container.pivot.x = this.container.width / 2;
    this.container.pivot.y = this.container.height / 2;

    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;
    this.resizeToFitScreen();

    window.addEventListener('pointerup', e => {
      if (e.button === 0) {
        this.isPainting = false;
      }
    });

    this.createGrid();
    this.createCellOutline();

    window.addEventListener('resize', () => this.resizeToFitScreen());

    app.ticker.add(() => this.update());
    this.rerender();
  }

  private createContextCellSprite() {
    const sprite = new PIXI.AnimatedSprite([
      textures.assets['selection']['1'].texture,
      textures.assets['selection']['2'].texture,
      textures.assets['selection']['3'].texture,
      textures.assets['selection']['4'].texture,
      textures.assets['selection']['5'].texture,
      textures.assets['selection']['6'].texture
    ]);

    sprite.x = 32;
    sprite.y = 32;
    sprite.gotoAndPlay(0);
    sprite.animationSpeed = 0.3;
    sprite.autoUpdate = true;
    sprite.scale.x = 2;
    sprite.scale.y = 2;
    sprite.pivot.x = sprite.width / 2;
    sprite.pivot.y = sprite.height / 2;
    this.app.stage.addChild(sprite);

    return sprite;
  }

  private cellHovered(cell: GridCell, x: number, y: number) {
    if (this.isPainting && cell.open !== (this.paintingMode === 'open')) {
      this.setCellOpen(cell, this.paintingMode === 'open');
      if (cell.open && this.changeCameraOnOpen) {
        state.selectedCell.x = x;
        state.selectedCell.y = y;
      } else if (state.selectedCell.x === x && state.selectedCell.y === y) {
        state.selectedCell.x = -1;
        state.selectedCell.y = -1;
      }
    }
  }

  private cellClicked(cell: GridCell, x: number, y: number) {
    this.setCellOpen(cell, !cell.open);
    this.paintingMode = !cell.open ? 'floor' : 'open';
    this.isPainting = true;

    if (cell.open && this.changeCameraOnOpen) {
      state.selectedCell.x = x;
      state.selectedCell.y = y;
    } else if (state.selectedCell.x === x && state.selectedCell.y === y) {
      state.selectedCell.x = -1;
      state.selectedCell.y = -1;
    }
  }

  private cellRightClicked(cell: GridCell, cellX: number, cellY: number) {
    if (cellX === state.contextCell.x && cellY === state.contextCell.y && state.contextCell.selected) {
      if (state.contextCell.visible) {
        state.contextCell.visible = false;
        state.contextCell.selected = false;
      } else {
        state.contextCell.visible = true;
      }
      return;
    }
    
    const screenX = cell.cells.wall.x;
    const screenY = cell.cells.wall.y;

    const { x, y } = cell.cells.wall.getGlobalPosition(new PIXI.Point(screenX, screenY));
    const popperX = x + (this.app.view as HTMLCanvasElement).getBoundingClientRect().left;
    const popperY = y + (this.app.view as HTMLCanvasElement).getBoundingClientRect().top;

    state.contextCell.x = cellX;
    state.contextCell.y = cellY;
    state.contextCell.screenX = popperX;
    state.contextCell.screenY = popperY;
    state.contextCell.visible = true;
    state.contextCell.selected = true;
    state.selectedTab = 3;
  }

  private createGrid() {
    for (let y = 0; y < gridSize - 1; y++) {
      const line = new PIXI.Graphics();
      line.lineStyle(1, gridColor, gridAlpha);
      line.moveTo(0, 0);
      line.lineTo(448, 0);
      line.pivot.x = line.width / 2;
      line.pivot.y = line.height / 2;
      line.x = this.app.screen.width / 2;
      line.y = (this.app.screen.height / 2) - (this.container.height / 2);
      this.app.stage.addChild(line);
      this.horizontalLines.push(line);
    }

    for (let x = 0; x < gridSize - 1; x++) {
      const line = new PIXI.Graphics();
      line.lineStyle(1, gridColor, gridAlpha);
      line.moveTo(0, 0);
      line.lineTo(0, 448);
      line.pivot.x = line.width / 2;
      line.pivot.y = line.height / 2;
      line.x = (this.app.screen.width / 2) - (this.container.width / 2);
      line.y = this.app.screen.height / 2;
      this.app.stage.addChild(line);
      this.verticalLines.push(line);
    }

    this.container.onpipmodechange = mode => {
      [...this.horizontalLines, ...this.verticalLines].forEach(line => {
        this.app.stage.removeChild(line);
        this.app.stage.addChild(line);
      });

      this.app.stage.removeChild(this.selectedCellOutline);
      this.app.stage.removeChild(this.selectedCellArrow);
      this.app.stage.removeChild(this.contextCell);
      this.app.stage.addChild(this.selectedCellOutline);
      this.app.stage.addChild(this.selectedCellArrow);
      this.app.stage.addChild(this.contextCell);
    };
  }

  private createCellOutline() {
    this.selectedCellOutline.lineStyle(2, 0xF06223);
    this.selectedCellOutline.drawRect(0, 0, 32, 32);
    this.selectedCellOutline.endFill();
    this.selectedCellOutline.visible = true;

    this.selectedCellOutline.pivot.x = this.selectedCellOutline.width / 2;
    this.selectedCellOutline.pivot.y = this.selectedCellOutline.height / 2;

    this.app.stage.addChild(this.selectedCellOutline);
    this.app.stage.addChild(this.selectedCellArrow);
  }

  public loadMap(skipValidation = false) {
    const currentDungeon = state.dungeons[state.currentDungeon];
    const currentFloor = currentDungeon.floors[state.currentFloor];
    const currentMap = currentFloor.map;
    state.currentMapValid = true;

    let hasFloorAbove = state.currentFloor > 0;
    let hasFloorBelow = state.currentFloor < currentDungeon.floors.length - 1;

    this.cells.forEach(cell => {
      const mapCell = currentMap[cell.y][cell.x];

      if (mapCell.type === 'wall') {
        this.setCellOpen(cell, false, skipValidation);
      } else {
        this.setCellOpen(cell, true, skipValidation);

        switch (mapCell.type) {
          case 'chest':
            cell.elements.chest.visible = true;
            break;
          case 'door':
            switch (mapCell.doorType) {
              case 'normal': cell.elements.door.visible = true; break;
              case 'dungeon door': cell.elements['dungeon-door'].visible = true; break;
              case 'magic door': cell.elements['magic-door'].visible = true; break;
            }
            break;
          case 'enemy':
            cell.elements.enemy.visible = true;
            break;
          case 'illusory wall':
            cell.elements['illusory-wall'].visible = true;
            break;
          case 'npc':
            cell.elements.npc.visible = true;
            break;
          case 'trap':
            cell.elements.trap.visible = true;
            break;
          case 'stairs':
            switch (mapCell.stairsType) {
              case 'up': cell.elements['stairs-up'].visible = true; break;
              case 'down': cell.elements['stairs-down'].visible = true; break;
            }
            break;
        }
      }

      if (hasFloorAbove) {
        const mapCellAbove = currentDungeon.floors[state.currentFloor - 1].map[cell.y][cell.x];
        if (mapCellAbove.type === 'trap') {
          cell.elements['trap-landing'].visible = true;
        }
      }
    });
  }

  private setCellOpen(cell: GridCell, open: boolean, skipValidation = false) {
    cell.open = open;
    cell.cells.floor.visible = open;
    cell.cells.wall.visible = !open;
    if (!skipValidation) cell.cells.invalid.visible = !open;

    for (const key in cell.elements) {
      (cell.elements as any)[key].visible = false;
    }

    const currentDungeon = state.dungeons[state.currentDungeon];
    const currentFloor = currentDungeon.floors[state.currentFloor];
    const currentType = currentFloor.map[cell.y][cell.x].type;

    if (open && currentType === 'wall') {
      currentFloor.map[cell.y][cell.x].type = 'open';
    } else if (!open && currentType !== 'wall') {
      currentFloor.map[cell.y][cell.x].type = 'wall';
    }

    if (!skipValidation) this.scanForValidCells();
    state.forceDungeonUpdate = true;
  }

  private setCellInvalid(cell: GridCell, invalid: boolean) {
    if (invalid) state.currentMapValid = false;

    cell.invalid = invalid;
    cell.cells.invalid.visible = invalid;

    const mapCell = getCell(cell.x, cell.y);
    if (!mapCell) return;
    if (mapCell.type === 'wall') {
      cell.cells.wall.visible = !invalid;
    } else {
      cell.cells.floor.visible = !invalid;
    }
  }

  private scanForValidCells() {
    state.currentMapValid = true;
    this.cells.forEach(cell => {
      const x = cell.x;
      const y = cell.y;
      const mapCell = getCell(x, y);
      if (mapCell && mapCell.type === 'wall') {
        this.setCellInvalid(cell, false);
        return;
      }
      this.setCellInvalid(cell, false);

      const [cell1, cell2, cell3] = getCellBatchRow([x - 1, x, x + 1], y + 1);
      const [cell4, cell6] = getCellBatchRow([x - 1, x + 1], y);
      const [cell7, cell8, cell9] = getCellBatchRow([x - 1, x, x + 1], y - 1);
      
      if (
        cell1 && cell1.type !== 'wall' &&
        cell2 && cell2.type !== 'wall' &&
        cell4 && cell4.type !== 'wall'
      ) {
        this.setCellInvalid(cell, true);
        this.setCellInvalid(this.getMapCell(x - 1, y + 1)!, true);
        this.setCellInvalid(this.getMapCell(x, y + 1)!, true);
        this.setCellInvalid(this.getMapCell(x - 1, y)!, true);
      }

      if (
        cell2 && cell2.type !== 'wall' &&
        cell3 && cell3.type !== 'wall' &&
        cell6 && cell6.type !== 'wall'
      ) {
        this.setCellInvalid(cell, true);
        this.setCellInvalid(this.getMapCell(x, y + 1)!, true);
        this.setCellInvalid(this.getMapCell(x + 1, y + 1)!, true);
        this.setCellInvalid(this.getMapCell(x + 1, y)!, true);
      }
      
      if (
        cell4 && cell4.type !== 'wall' &&
        cell7 && cell7.type !== 'wall' &&
        cell8 && cell8.type !== 'wall'
      ) {
        this.setCellInvalid(cell, true);
        this.setCellInvalid(this.getMapCell(x - 1, y)!, true);
        this.setCellInvalid(this.getMapCell(x - 1, y - 1)!, true);
        this.setCellInvalid(this.getMapCell(x, y - 1)!, true);
      }

      if (
        cell6 && cell6.type !== 'wall' &&
        cell8 && cell8.type !== 'wall' &&
        cell9 && cell9.type !== 'wall'
      ) {
        this.setCellInvalid(cell, true);
        this.setCellInvalid(this.getMapCell(x + 1, y)!, true);
        this.setCellInvalid(this.getMapCell(x, y - 1)!, true);
        this.setCellInvalid(this.getMapCell(x + 1, y - 1)!, true);
      }
    });
  }

  private createCell() {
    const wallCell = new PIXI.Graphics();
    wallCell.beginFill(wallColor);
    wallCell.drawRect(0, 0, 32, 32);
    wallCell.endFill();

    const floorCell = new PIXI.Graphics();
    floorCell.beginFill(floorColor);
    floorCell.drawRect(0, 0, 32, 32);
    floorCell.endFill();

    const invalidCell = new PIXI.Graphics();
    invalidCell.beginFill(invalidCellColor);
    invalidCell.drawRect(0, 0, 32, 32);
    invalidCell.endFill();

    const elements: any = {};

    for (const key in textures.assets['map-elements']) {
      const element = new PIXI.Sprite(textures.assets['map-elements'][key].texture);
      element.pivot.x = element.width / 2;
      element.pivot.y = element.height / 2;
      element.visible = false;
      element.eventMode = 'none';
      elements[key] = element;
    }

    return { wallCell, floorCell, invalidCell, elements };
  }

  private getMapCell(x: number, y: number) {
    return this.cells.find(cell => cell.x === x && cell.y === y);
  }

  public resizeToFitScreen() {
    this.container.targetScale = 1;
    this.container.targetX = this.app.screen.width / 2;
    this.container.targetY = this.app.screen.height / 2;
    this.rerender();
  }
  
  public setGridVisible(visible: boolean) {
    this.gridVisible = visible;
    this.horizontalLines.forEach(line => line.visible = visible);
    this.verticalLines.forEach(line => line.visible = visible);
  }

  public get isGridVisible() {
    return this.gridVisible;
  }

  private update() {
    // if (!this.needsResize()) return;
    this.rerender();
  }

  private rerender() {
    this.container.update();

    const offsetX = this.container.x - (this.container.width / 2);
    const offsetY = this.container.y - (this.container.height / 2);
    const lineSpacingX = this.container.width / this.totalLines;
    const lineSpacingY = this.container.height / this.totalLines;

    this.horizontalLines.forEach((line, lineIndex) => {
      line.scale.x = this.container.scale.x;
      line.x = this.container.x;
      line.y = offsetY + lineSpacingY * (lineIndex + 1);
    });
    
    this.verticalLines.forEach((line, lineIndex) => {
      line.scale.y = this.container.scale.y;
      line.x = offsetX + lineSpacingX * (lineIndex + 1);
      line.y = this.container.y;
    });

    const cellSize = 32 * this.container.scale.x;
    state.cellSize = cellSize;

    this.contextCell.visible = state.contextCell.selected;
    this.contextCell.scale.x = this.container.scale.x * 2;
    this.contextCell.scale.y = this.container.scale.y * 2;
    this.contextCell.x = offsetX + (state.contextCell.x * cellSize) + (this.contextCell.width);
    this.contextCell.y = offsetY + (state.contextCell.y * cellSize) + (this.contextCell.height);

    if (state.selectedCell.x === -1 && state.selectedCell.y === -1) {
      if (this.selectedCellOutline.visible) this.selectedCellOutline.visible = false;
      if (this.selectedCellArrow.visible) this.selectedCellArrow.visible = false;
    } else {
      if (!this.selectedCellOutline.visible) this.selectedCellOutline.visible = true;
      if (!this.selectedCellArrow.visible) this.selectedCellArrow.visible = true;

      this.selectedCellOutline.scale.x = this.container.scale.x;
      this.selectedCellOutline.scale.y = this.container.scale.y;
      this.selectedCellOutline.x = offsetX + (state.selectedCell.x * cellSize) + (this.selectedCellOutline.width / 2);
      this.selectedCellOutline.y = offsetY + (state.selectedCell.y * cellSize) + (this.selectedCellOutline.height / 2);

      this.selectedCellArrow.scale.x = this.container.scale.x;
      this.selectedCellArrow.scale.y = this.container.scale.y;
      this.selectedCellArrow.x = offsetX + (state.selectedCell.x * cellSize) + (this.selectedCellOutline.width / 2);
      this.selectedCellArrow.y = offsetY + (state.selectedCell.y * cellSize) + (this.selectedCellOutline.height / 2);

      switch (state.cameraDirection) {
        case 'north':
          this.selectedCellArrow.rotation = Math.PI * 1.5;
          break;
        case 'east':
          this.selectedCellArrow.rotation = 0;
          break;
        case 'south':
          this.selectedCellArrow.rotation = Math.PI / 2;
          break;
        case 'west':
          this.selectedCellArrow.rotation = Math.PI;
          break;
      }
    }
  }
}