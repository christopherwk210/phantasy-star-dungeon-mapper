import type { PhantasyStar } from '@/map.interface';
import { state } from '@/store';
import type { textures } from './images';

enum CellType {
  WALL,
  OPEN,
  DOOR,
  DUNGEON_DOOR,
  MAGIC_DOOR,
  STAIRS_UP,
  STAIRS_DOWN,
  NPC_ROOM
}

type WallType = 'WALL' | 'STAIRS_UP' | 'STAIRS_DOWN' | 'DOOR' | 'MAGIC_DOOR' | 'DUNGEON_DOOR';
type CellPattern = CellType[][];
type Side = 'LEFT' | 'RIGHT' | 'FULL';
type Key = keyof typeof textures.assets;

export function getSlices(): WallType | [Side, Key, string, number][] {
  const positionMap = parsePosition();

  const immediatePosition = positionMap[3][1];
  switch (immediatePosition) {
    case CellType.WALL: return 'WALL';
    case CellType.STAIRS_UP: return 'STAIRS_UP';
    case CellType.STAIRS_DOWN: return 'STAIRS_DOWN';
    case CellType.DOOR: return 'DOOR';
    case CellType.MAGIC_DOOR: return 'MAGIC_DOOR';
    case CellType.DUNGEON_DOOR: return 'DUNGEON_DOOR';
  }

  //#region row 4

  const output: [Side, Key, string, number][] = [];
  output.push(['FULL', 'straight-step', '2_to_1', 1]);

  // If we can't move forward...
  if (!comparePatternRowCell(positionMap, CellType.OPEN, 2, 1)) {
    // ...determine the type of wall we're looking at
    if (positionMap[2][1] === CellType.WALL) {
      output.push(['FULL', 'dead-end', '2_to_1', 3]);
      output.push(['FULL', 'dead-end', '2_to_1', 4]);
    } else {
      output.push(['FULL', 'dead-end-door', '2_to_1', 3]);
      output.push(['FULL', 'dead-end-door', '2_to_1', 4]);
    }

    // If the immediate left is open...
    if (comparePatternRowCell(positionMap, CellType.OPEN, 3, 0)) {
      // ...then we will always see this hallway
      output.push(['LEFT', 't-side-exit', '2_to_1', 2]);
    } else {
      // ...otherwise we will always see this wall.
      output.push(['LEFT', 'dead-end', '2_to_1', 2]);
    }

    // If the immediate right is open...
    if (comparePatternRowCell(positionMap, CellType.OPEN, 3, 2)) {
      // ...then we will always see this hallway
      output.push(['RIGHT', 't-side-exit', '2_to_1', 2]);
    } else {
      // ...otherwise we will always see this wall.
      output.push(['RIGHT', 'dead-end', '2_to_1', 2]);
    }

    return output;
  }

  //#endregion

  //#region row 3

  // If we can move forward...
  if (comparePatternRowCell(positionMap, CellType.OPEN, 2, 1)) {
    // ...then we will always see these walls.
    output.push(['FULL', 'straight-step', '2_to_1', 1]);

    // If the immediate left is open...
    if (comparePatternRowCell(positionMap, CellType.OPEN, 3, 0)) {
      // ...then we will always see this hallway
      output.push(['LEFT', 'side-exit', '2_to_1', 2]);
    } else {
      // ...otherwise we will always see this wall.
      output.push(['LEFT', 'straight-step', '2_to_1', 2]);
    }

    // If the immediate right is open...
    if (comparePatternRowCell(positionMap, CellType.OPEN, 3, 2)) {
      // ...then we will always see this hallway
      output.push(['RIGHT', 'side-exit', '2_to_1', 2]);
    } else {
      // ...otherwise we will always see this wall.
      output.push(['RIGHT', 'straight-step', '2_to_1', 2]);
    }

    // If we can't move forward again...
    if (!comparePatternRowCell(positionMap, CellType.OPEN, 1, 1)) {
      // If the third row left is open...
      if (comparePatternRowCell(positionMap, CellType.OPEN, 2, 0)) {
        // ...then we will always see this hallway
        output.push(['LEFT', 't-side-exit', '3_to_2', 3]);
      } else {
        // ...otherwise we will always see this wall.
        output.push(['LEFT', 'dead-end', '3_to_2', 3]);
      }

      // If the third row right is open...
      if (comparePatternRowCell(positionMap, CellType.OPEN, 2, 2)) {
        // ...then we will always see this hallway
        output.push(['RIGHT', 't-side-exit', '3_to_2', 3]);
      } else {
        // ...otherwise we will always see this wall.
        output.push(['RIGHT', 'dead-end', '3_to_2', 3]);
      }

      if (positionMap[1][1] === CellType.WALL) {
        output.push(['FULL', 'dead-end', '3_to_2', 4]);
      } else {
        output.push(['FULL', 'dead-end-door', '3_to_2', 4]);
      }
      return output;
    }
  }

  //#endregion

  //#region row 2

  // If we can move forward...
  if (comparePatternRowCell(positionMap, CellType.OPEN, 1, 1)) {
    // If the third row left is open...
    if (comparePatternRowCell(positionMap, CellType.OPEN, 2, 0)) {
      // ...then we will always see this hallway
      output.push(['LEFT', 'side-exit', '3_to_2', 3]);
    } else {
      // ...otherwise we will always see this wall.
      output.push(['LEFT', 'straight-step', '2_to_1', 3]);
    }

    // If the third row right is open...
    if (comparePatternRowCell(positionMap, CellType.OPEN, 2, 2)) {
      // ...then we will always see this hallway
      output.push(['RIGHT', 'side-exit', '3_to_2', 3]);
    } else {
      // ...otherwise we will always see this wall.
      output.push(['RIGHT', 'straight-step', '2_to_1', 3]);
    }

    // If we can't move forward again...
    if (!comparePatternRowCell(positionMap, CellType.OPEN, 0, 1)) {
      // ...and the left is open
      if (comparePatternRowCell(positionMap, CellType.OPEN, 1, 0)) {
        output.push(['LEFT', 't-side-exit', '4_to_3', 5]);
      } else {
        output.push(['LEFT', 'dead-end', '4_to_3', 5])
      }

      // ...and the right is open
      if (comparePatternRowCell(positionMap, CellType.OPEN, 1, 2)) {
        output.push(['LEFT', 't-side-exit', '4_to_3', 6]);
      } else {
        output.push(['LEFT', 'dead-end', '4_to_3', 6]);
      }
      return output;
    }
  }

  //#endregion

  //#region row 1

  // If we can move forward...
  if (comparePatternRowCell(positionMap, CellType.OPEN, 0, 1)) {
    // ...and the left is open
    if (comparePatternRowCell(positionMap, CellType.OPEN, 1, 0)) {
      output.push(['LEFT', 'side-exit', '4_to_3', 4]);
    } else {
      output.push(['LEFT', 'straight-step', '2_to_1', 5])
    }

    // ...and the right is open
    if (comparePatternRowCell(positionMap, CellType.OPEN, 1, 2)) {
      output.push(['RIGHT', 'side-exit', '4_to_3', 4]);
    } else {
      output.push(['LEFT', 'straight-step', '2_to_1', 6])
    }
  }

  //#endregion

  return output;
}

function comparePatternRowCell(pattern: CellPattern, cellType: CellType, row: 0 | 1 | 2 | 3, cell: 0 | 1 | 2) {
  return pattern[row][cell] === cellType;
}

function parsePosition(): CellPattern {
  const currentDungeon = state.dungeons[state.currentDungeon];
  const currentFloor = currentDungeon.floors[state.currentFloor];
  const currentMap = currentFloor.map;

  let xdir = 0;
  let ydir = 0;
  switch (state.cameraDirection) {
    case 'north': ydir = -1; break;
    case 'south': ydir = 1; break;
    case 'east': xdir = 1; break;
    case 'west': xdir = -1; break;
  }

  let searchCellCoords = { x: state.selectedCell.x, y: state.selectedCell.y };
  const getSearchCell: () => PhantasyStar.MapCell = () => {
    const row = currentMap[searchCellCoords.y];
    if (row) {
      const cell = row[searchCellCoords.x];
      if (cell) {
        return cell;
      }
    }

    return { type: 'wall' };
  }

  const moveForward = () => {
    searchCellCoords.x += xdir;
    searchCellCoords.y += ydir;
  };

  const moveLeft = () => {
    switch (state.cameraDirection) {
      case 'north': searchCellCoords.x -= 1; break;
      case 'south': searchCellCoords.x += 1; break;
      case 'east': searchCellCoords.y -= 1; break;
      case 'west': searchCellCoords.y += 1; break;
    }
  };

  const moveRight = () => {
    switch (state.cameraDirection) {
      case 'north': searchCellCoords.x += 1; break;
      case 'south': searchCellCoords.x -= 1; break;
      case 'east': searchCellCoords.y += 1; break;
      case 'west': searchCellCoords.y -= 1; break;
    }
  };

  const peekLeft = () => {
    moveLeft();
    const cell = getSearchCell();
    moveRight();
    return cell;
  };

  const peekRight = () => {
    moveRight();
    const cell = getSearchCell();
    moveLeft();
    return cell;
  };

  const getCellTypeForPeek = (cell: PhantasyStar.MapCell) => {
    switch (cell.type) {
      case 'open':
      case 'chest':
      case 'enemy':
      case 'trap':
        return CellType.OPEN;
      case 'npc':
        return cell.npcType === 'room' ? CellType.NPC_ROOM : CellType.OPEN;
      case 'stairs':
        return cell.stairsType === 'up' ? CellType.STAIRS_UP : CellType.STAIRS_DOWN;
      case 'door':
        switch (cell.doorType) {
          case 'door': return CellType.DOOR;
          case 'magic door': return CellType.MAGIC_DOOR;
          case 'dungeon door': return CellType.DUNGEON_DOOR;
        }
      case 'wall':
      default:
        return CellType.WALL;
    }
  };

  const row1 = [CellType.WALL, CellType.WALL, CellType.WALL];
  const row2 = [CellType.WALL, CellType.WALL, CellType.WALL];
  const row3 = [CellType.WALL, CellType.WALL, CellType.WALL];
  const row4 = [CellType.WALL, CellType.WALL, CellType.WALL];

  moveForward();

  row4[0] = getCellTypeForPeek(peekLeft());
  row4[1] = getCellTypeForPeek(getSearchCell());
  row4[2] = getCellTypeForPeek(peekRight());

  moveForward();

  row3[0] = getCellTypeForPeek(peekLeft());
  row3[1] = getCellTypeForPeek(getSearchCell());
  row3[2] = getCellTypeForPeek(peekRight());

  moveForward();

  row2[0] = getCellTypeForPeek(peekLeft());
  row2[1] = getCellTypeForPeek(getSearchCell());
  row2[2] = getCellTypeForPeek(peekRight());

  moveForward();

  row1[0] = getCellTypeForPeek(peekLeft());
  row1[1] = getCellTypeForPeek(getSearchCell());
  row1[2] = getCellTypeForPeek(peekRight());

  return [
    row1,
    row2,
    row3,
    row4
  ];
}