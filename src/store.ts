import { computed, reactive } from 'vue';
import { createBlankMap } from './map-utils';
import { Palette } from './map.interface';
import type { PhantasyStar } from './map.interface';

export const blankDungeon: PhantasyStar.Dungeon = {
  name: 'Dungeon',
  palettes: {
    floors: Palette.GREEN,
    walls: Palette.GREEN
  },
  floors: [
    {
      enemyList: [],
      illusoryWalls: [],
      map: createBlankMap()
    }
  ]
};

export const blankFloor: PhantasyStar.MapFloor = {
  enemyList: [],
  illusoryWalls: [],
  map: createBlankMap()
}

interface Link {
  name: string;
  icon: string;
  selectedIcon: string;
}

const startingMap = createBlankMap();
startingMap[8][5].type = 'open';
startingMap[7][5].type = 'open';
startingMap[6][5].type = 'open';
startingMap[5][5].type = 'open';

startingMap[5][6].type = 'open';
startingMap[5][7].type = 'open';

startingMap[8][6].type = 'open';
startingMap[8][7].type = 'open';

startingMap[8][8].type = 'open';
startingMap[7][8].type = 'open';
startingMap[6][8].type = 'open';
startingMap[5][8].type = 'open';

export const state = reactive({
  dungeons: [
    {
      name: 'My First Dungeon',
      palettes: {
        floors: Palette.GREEN,
        walls: Palette.GREEN
      },
      floors: [
        {
          enemyList: [],
          illusoryWalls: [],
          map: startingMap
        }
      ]
    }
  ] as PhantasyStar.Dungeon[],
  selectedCell: {
    x: 5,
    y: 8
  },
  currentMapValid: true,
  cameraDirection: 'north' as 'north' | 'south' | 'east' | 'west',
  currentDungeon: 0,
  currentFloor: 0,
  links: [
    {
      name: 'Dungeons',
      icon: 'bi-geo-alt',
      selectedIcon: 'bi-geo-alt-fill'
    },
    {
      name: 'Dungeon Config',
      icon: 'bi-gear',
      selectedIcon: 'bi-gear-fill'
    },
    {
      name: 'Floors',
      icon: 'bi-layers',
      selectedIcon: 'bi-layers-fill'
    },
    {
      name: 'Inspector',
      icon: 'bi-box',
      selectedIcon: 'bi-box-fill'
    },
    {
      name: 'Enemies',
      icon: 'bi-bug',
      selectedIcon: 'bi-bug-fill'
    },
    {
      name: 'Music',
      icon: 'bi-music-note',
      selectedIcon: 'bi-music-note-list'
    },
    {
      name: 'Help',
      icon: 'bi-question-circle',
      selectedIcon: 'bi-question-circle-fill'
    }
  ] as Link[],
  selectedTab: 0,
  contextCell: {
    x: 0,
    y: 0,
    screenX: 0,
    screenY: 0,
    visible: false,
    selected: false
  },
  cellSize: 32
});

export function getCell(x: number, y: number) {
  const row = state.dungeons[state.currentDungeon].floors[state.currentFloor].map[y];
  if (row) {
    return row[x];
  }
}

export function useState() {
  const currentDungeon = computed<PhantasyStar.Dungeon>(() => state.dungeons[state.currentDungeon]);
  const currentTab = computed<Link>(() => state.links[state.selectedTab]);
  const currentFloor = computed<PhantasyStar.MapFloor>(() => currentDungeon.value.floors[state.currentFloor]);
  const selectedCell = computed<PhantasyStar.MapCell>(() => {
    if (state.contextCell.selected) {
      return getCell(state.contextCell.x, state.contextCell.y)!;
    } else {
      return getCell(0, 0)!;
    }
  });

  return { state, currentDungeon, currentTab, currentFloor, selectedCell, getCell }; 
}