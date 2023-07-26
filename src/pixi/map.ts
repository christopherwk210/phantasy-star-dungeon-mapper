import * as PIXI from 'pixi.js';
import { state, getCell } from '@/store';
import { PIPContainer } from './pip-container';
import { reactive } from 'vue';

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

  private isPainting = false;
  private paintingMode: 'open' | 'floor' = 'floor';

  private gridVisible = true;

  constructor(private app: PIXI.Application, parent?: PIXI.Container) {
    this.container = new PIPContainer(app);
    (parent || app.stage).addChild(this.container);

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const { wallCell, floorCell, invalidCell } = this.createCell();
        const gridCell: GridCell = {
          cells: {
            wall: wallCell,
            floor: floorCell,
            invalid: invalidCell
          },
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
      }
    }

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

  private cellRightClicked(cell: GridCell, x: number, y: number) {
    console.log(`Cell right clicked: ${x}, ${y}`)
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
      this.app.stage.addChild(this.selectedCellOutline);
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
  }

  public loadMap() {
    const currentDungeon = state.dungeons[state.currentDungeon];
    const currentFloor = currentDungeon.floors[state.currentFloor];
    const currentMap = currentFloor.map;
    state.currentMapValid = true;

    this.cells.forEach(cell => {
      const mapCell = currentMap[cell.y][cell.x];
      if (mapCell.type === 'wall') {
        this.setCellOpen(cell, false);
      } else {
        this.setCellOpen(cell, true);
      }
    });
  }

  private setCellOpen(cell: GridCell, open: boolean) {
    cell.open = open;
    cell.cells.floor.visible = open;
    cell.cells.wall.visible = !open;
    cell.cells.invalid.visible = !open;

    const currentDungeon = state.dungeons[state.currentDungeon];
    const currentFloor = currentDungeon.floors[state.currentFloor];
    const currentType = currentFloor.map[cell.y][cell.x].type;

    if (open && currentType === 'wall') {
      currentFloor.map[cell.y][cell.x].type = 'open';
    } else if (!open && currentType !== 'wall') {
      currentFloor.map[cell.y][cell.x].type = 'wall';
    }

    this.scanForValidCells();
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

      const cell1 = getCell(x - 1, y + 1);
      const cell2 = getCell(x, y + 1);
      const cell3 = getCell(x + 1, y + 1);
      const cell4 = getCell(x - 1, y);
      const cell6 = getCell(x + 1, y);
      const cell7 = getCell(x - 1, y - 1);
      const cell8 = getCell(x, y - 1);
      const cell9 = getCell(x + 1, y - 1);
      
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

    return { wallCell, floorCell, invalidCell };
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

    if (state.selectedCell.x === -1 && state.selectedCell.y === -1) {
      if (this.selectedCellOutline.visible) this.selectedCellOutline.visible = false;
    } else {
      if (!this.selectedCellOutline.visible) this.selectedCellOutline.visible = true;

      this.selectedCellOutline.scale.x = this.container.scale.x;
      this.selectedCellOutline.scale.y = this.container.scale.y;
      const cellSize = 32 * this.container.scale.x;
      this.selectedCellOutline.x = offsetX + (state.selectedCell.x * cellSize) + (this.selectedCellOutline.width / 2);
      this.selectedCellOutline.y = offsetY + (state.selectedCell.y * cellSize) + (this.selectedCellOutline.height / 2);
      // this.selectedCellOutline.x += (this.selectedCellOutline.scale.x * 0)
    }
  }
}