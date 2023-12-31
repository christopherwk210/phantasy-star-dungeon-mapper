<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { useState } from '@/store';
import { init } from '@/pixi';
import type { PhantasyStar } from '@/map.interface';

const container = ref<HTMLElement>();
const { state, selectedCell, currentFloor } =  useState();

const pixiMethods = ref({
  resetZoom: () => {},
  zoomIn: () => {},
  zoomOut: () => {},
  setGridVisible: (visible: boolean) => {},
  gridVisible: (() => {}) as () => boolean,
  loadMap: (skipValidation?: boolean) => {},
  switchView: () => {},
  updatePalette: () => {},
  triggerDungeonViewUpdate: () => {}
});

const toolbarButtons = [
  {
    name: 'Zoom In',
    icon: 'bi-zoom-in',
    action: () => pixiMethods.value.zoomIn()
  },
  {
    name: 'Zoom Out',
    icon: 'bi-zoom-out',
    action: () => pixiMethods.value.zoomOut()
  },
  {
    name: 'Reset View',
    icon: 'bi-house',
    action: () => pixiMethods.value.resetZoom()
  },
  {
    name: 'Toggle Grid',
    icon: 'bi-grid-3x3',
    action: () => pixiMethods.value.setGridVisible(!pixiMethods.value.gridVisible())
  },
  {
    name: 'Swap Views',
    icon: 'bi-repeat',
    action: () => pixiMethods.value.switchView()
  }
];

onMounted(async () => {
  if (container.value) {
    container.value.addEventListener('contextmenu', (e) => e.preventDefault());
    const {
      resetZoom, zoomIn, zoomOut,
      gridVisible, setGridVisible,
      loadMap,
      switchView,
      updatePalette, triggerDungeonViewUpdate
    } = await init(container.value);

    pixiMethods.value.resetZoom = resetZoom;
    pixiMethods.value.zoomIn = zoomIn;
    pixiMethods.value.zoomOut = zoomOut;
    pixiMethods.value.gridVisible = gridVisible;
    pixiMethods.value.setGridVisible = setGridVisible;
    pixiMethods.value.loadMap = loadMap;
    pixiMethods.value.switchView = switchView;
    pixiMethods.value.updatePalette = updatePalette;
    pixiMethods.value.triggerDungeonViewUpdate = triggerDungeonViewUpdate;

    loadMap();
    triggerDungeonViewUpdate();

    window.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        switchView();
      }
    });
  }
});

window.addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    if (e.shiftKey) {
      state.contextCell.selected = false;
      state.contextCell.visible = false;
      state.selectedCell.x = -1;
      state.selectedCell.y = -1;

      if (e.key === 'ArrowUp') {
        moveAllMapCellsUp();
      } else if (e.key === 'ArrowDown') {
        moveAllMapCellsDown();
      } else if (e.key === 'ArrowLeft') {
        moveAllMapCellsLeft();
      } else if (e.key === 'ArrowRight') {
        moveAllMapCellsRight();
      }
    }

    if ((e.target as HTMLElement).tagName === 'SELECT') {
      e.preventDefault();
    }
  }
});

function moveAllMapCellsUp() {
  const map = currentFloor.value.map;
  const firstRow = map.splice(0, 1)[0];
  map.push(firstRow);
  loadMap(true);
  triggerDungeonViewUpdate();
}

function moveAllMapCellsDown() {
  const map = currentFloor.value.map;
  const lastRow = map.splice(map.length - 1, 1)[0];
  map.unshift(lastRow);
  loadMap(true);
  triggerDungeonViewUpdate();
}

function moveAllMapCellsLeft() {
  const map = currentFloor.value.map;
  for (let i = 0; i < map.length; i++) {
    const firstCell = map[i].splice(0, 1)[0];
    map[i].push(firstCell);
  }
  loadMap(true);
  triggerDungeonViewUpdate();
}

function moveAllMapCellsRight() {
  const map = currentFloor.value.map;
  for (let i = 0; i < map.length; i++) {
    const lastCell = map[i].splice(map[i].length - 1, 1)[0];
    map[i].unshift(lastCell);
  }
  loadMap(true);
  triggerDungeonViewUpdate();
}

function loadMap(skipValidation?: boolean) {
  if (pixiMethods.value.loadMap) pixiMethods.value.loadMap(skipValidation);
}

function updatePalette() {
  if (pixiMethods.value.updatePalette) pixiMethods.value.updatePalette();
}

function triggerDungeonViewUpdate() {
  if (pixiMethods.value.triggerDungeonViewUpdate) pixiMethods.value.triggerDungeonViewUpdate();
}

watch([
  () => state.currentDungeon,
  () => state.currentFloor,
  () => state.dungeons
], () => {
  state.selectedCell.x = -1;
  state.selectedCell.y = -1;
  loadMap();
  updatePalette();
  triggerDungeonViewUpdate();
});

watch([
  () => selectedCell.value.type,
  () => (selectedCell.value as PhantasyStar.MapCellDoor).doorType,
  () => (selectedCell.value as PhantasyStar.MapCellNpc).npcType,
  () => (selectedCell.value as PhantasyStar.MapCellStairs).stairsType
], () => {
  loadMap(true);
  triggerDungeonViewUpdate();
});

watch([
  () => state.forceDungeonUpdate
], () => {
  state.forceDungeonUpdate = false;
  triggerDungeonViewUpdate();
}, { deep: true });

watch([
  () => state.dungeons[state.currentDungeon].palettes
], () => {
  updatePalette();
}, { deep: true });

watch([
  () => state.cameraDirection,
  () => state.selectedCell.x,
  () => state.selectedCell.y
], () => {
  triggerDungeonViewUpdate();
});
</script>

<template>
  <div class="pixi-container" ref="container">
    <div class="controls bg-secondary text-light d-flex">
      <i v-for="(button, buttonIndex) of toolbarButtons" @click="button.action()" class="cursor-pointer btn-link text-white-50">
        <i :class="[button.icon]"></i>
      </i>
    </div>
  </div>
</template>

<style scoped>
  .pixi-container {
    display: flex;
    flex: 1;
    overflow: hidden;
    height: 100%;
    height: calc(100vh - 56px);
    position: relative;
  }

  .controls {
    position: absolute;
    top: 1em;
    left: 50%;
    transform: translateX(-50%);
  }

  .btn-link {
    height: 100%;
    font-size: 18px;
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    width: 40px;
    height: 40px;
  }

  .btn-link:hover {
    background-color: rgba(0, 0, 0, 0.1);
    color: white !important;
  }
</style>