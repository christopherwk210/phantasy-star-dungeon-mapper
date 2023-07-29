export enum Palette {
  GREEN,
  DARK_BLUE,
  BLUE,
  PURPLE,
  YELLOW,
  GOLDEN,
  BLACK_BLUE,
  LIGHT_BLUE,
  RED,
  ORANGE,
  DARK_GREEN
}

export const paletteColors: { [key in Palette]: { floors: PhantasyStar.ColorPalette; walls: PhantasyStar.ColorPalette; } } = {
  [Palette.GREEN]: {
    walls: [0x005554, 0x00AA55, 0x00FF55, 0xAAFFA9],
    floors: [0x005554, 0x55AA54, 0x55FF54, 0xAAFFA9]
  },
  [Palette.DARK_BLUE]: {
    walls: [0x000055, 0x0000FF, 0x0055FE, 0x00AAFE],
    floors: [0x000055, 0x000055, 0x0000A9, 0x0000FF]
  },
  [Palette.BLUE]: {
    walls: [0x0000A9, 0x0055FE, 0x00AAFE, 0x00FFFE],
    floors: [0x0000A9, 0x0000FF, 0x0055FE, 0x00AAFE]
  },
  [Palette.PURPLE]: {
    walls: [0x000055, 0x5555AA, 0xAAAAAA, 0xFFFFFF],
    floors: [0x000055, 0x0000A9, 0x5555AA, 0xAAAAAA]
  },
  [Palette.YELLOW]: {
    walls: [0xAA5500, 0xFFAA00, 0xFFFF00, 0xFFFFFF],
    floors: [0xAA5500, 0xFFAA00, 0xFFFF00, 0xFFFFFF]
  },
  [Palette.GOLDEN]: {
    walls: [0xAA5500, 0xFFAA55, 0xFFFF55, 0xFFFFFF],
    floors: [0xAA5500, 0xFF5555, 0xFFAA55, 0xFFFF55]
  },
  [Palette.BLACK_BLUE]: {
    walls: [0x000000, 0x00AAFE, 0x00FFFE, 0xFFFFFF],
    floors: [0x000000, 0x000000, 0x000000, 0x000000]
  }, 
  [Palette.LIGHT_BLUE]: {
    walls: [0x0000FF, 0x00AAFE, 0x00FFFE, 0xFFFFFF],
    floors: [0x0000FF, 0x0055FE, 0x00AAFE, 0x00FFFE]
  },
  [Palette.RED]: {
    walls: [0x550000, 0xAA0000, 0xFF0000, 0xFF5500],
    floors: [0x550000, 0x550000, 0xAA0000, 0xFF0000]
  },
  [Palette.ORANGE]: {
    walls: [0xAA0000, 0xFF5500, 0xFFAA00, 0xFFFF55],
    floors: [0xAA0000, 0xFF0000, 0xFF5500, 0xFFAA00]
  },
  [Palette.DARK_GREEN]: {
    walls: [0x005500, 0x00AA00, 0x00FF00, 0xFFFFFF],
    floors: [0x005500, 0x005500, 0x00AA00, 0x00FF00]
  }
};

export namespace PhantasyStar {
  export type ColorPalette = [number, number, number, number];

  export type Enemy =
    'Ammonite' |
    'Androcop' |
    'Antlion' |
    'Barbarian' |
    'Batalion' |
    'Big Club' |
    'Blue Slime' |
    'Centaur' |
    'Crawler' |
    'Dead Tree' |
    'Dezorian' |
    'E. Farmer' |
    'Elephant' |
    'Evildead' |
    'Executer' |
    'Fishman' |
    'Frostman' |
    'Ghoul' |
    'Giant' |
    'Giant Fly' |
    'Goldlens' |
    'Gold Scorpion' |
    'Golem' |
    'Green Dragon' |
    'Green Slime' |
    'Horseman' |
    'Leech' |
    'Lich' |
    'Magician' |
    'Mammoth' |
    'Maneater' |
    'Manticor' |
    'Marauder' |
    'Marman' |
    'N. Farmer' |
    'Nessie' |
    'Octopus' |
    'Owl Bear' |
    'Reaper' |
    'Red Dragon' |
    'Red Slime' |
    'Robotcop' |
    'Sandworm' |
    'Scorpion' |
    'Scorpius' |
    'Serpent' |
    'Shellfish' |
    'Skeleton' |
    'Skull-en' |
    'Sorcerer' |
    'Sphinx' |
    'Stalker' |
    'Sworm' |
    'Tarantul' |
    'Tentacle' |
    'Titan' |
    'Vampire' |
    'Werebat' |
    'White Dragon' |
    'Wight' |
    'Wing Eye' |
    'Wyvern' |
    'Zombie' |
    
    'Blue Dragon' |
    'Darkfalz' |
    'Dr. Mad' |
    'Gold Dragon' |
    'Lassic' |
    'Medusa' |
    'Saccubus' |
    'Shadow' |
    'Tajima'
  ;

  export interface Dungeon {
    name: string;
    palettes: {
      walls: Palette;
      floors: Palette;
    };
    floors: MapFloor[];
  }

  export interface MapFloor {
    enemyList: Enemy[];
    illusoryWalls: illusoryWall[];
    map: [
      [MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell],
      [MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell],
      [MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell],
      [MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell],
      [MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell],
      [MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell],
      [MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell],
      [MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell],
      [MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell],
      [MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell],
      [MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell],
      [MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell],
      [MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell],
      [MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell, MapCell]
    ]
  }

  export type FloorMap = MapFloor['map'];

  export interface illusoryWall {
    cell1: [number, number];
    cell2: [number, number];
  }

  interface BaseMapCell {
    type: 'open' | 'wall' | 'door' | 'stairs' | 'chest' | 'trap' | 'enemy' | 'npc';
  }

  export interface MapCellOpen extends BaseMapCell {
    type: 'open';
  }
  export interface MapCellWall extends BaseMapCell {
    type: 'wall';
  }
  export interface MapCellDoor extends BaseMapCell {
    type: 'door';
    doorType: 'normal' | 'dungeon door' | 'magic door';
    destination: string;
  }
  export interface MapCellStairs extends BaseMapCell {
    type: 'stairs';
    stairsType: 'up' | 'down';
    destination: string;
  }
  export interface MapCellChest extends BaseMapCell {
    type: 'chest';
    trapType: 'spear' | 'bomb' | 'none';
    reward: string;
  }
  export interface MapCellTrap extends BaseMapCell {
    type: 'trap';
  }
  export interface MapCellEnemy extends BaseMapCell {
    type: 'enemy';
    enemyType: Enemy;
    reward: string;
  }
  export interface MapCellNpc extends BaseMapCell {
    type: 'npc';
    npcType: 'room' | 'normal';
    name: string;
    notes: string;
  }

  export type MapCell = MapCellOpen | MapCellWall | MapCellDoor | MapCellStairs | MapCellChest | MapCellTrap | MapCellEnemy | MapCellNpc;
}