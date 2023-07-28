<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { state } from '@/store';
import { init } from '@/pixi';

const container = ref<HTMLElement>();

const pixiMethods = ref({
  resetZoom: () => {},
  zoomIn: () => {},
  zoomOut: () => {},
  setGridVisible: (visible: boolean) => {},
  gridVisible: (() => {}) as () => boolean,
  loadMap: () => {},
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

watch([
  () => state.currentDungeon,
  () => state.currentFloor,
  () => state.dungeons
], () => {
  state.selectedCell.x = -1;
  state.selectedCell.y = -1;
  loadMap();
  updatePalette();
});

watch([
  () => state.dungeons[state.currentDungeon].floors[state.currentFloor].map
], () => {
  triggerDungeonViewUpdate();
}, { deep: true });

function loadMap() {
  if (pixiMethods.value.loadMap) pixiMethods.value.loadMap();
}

watch([
  () => state.dungeons[state.currentDungeon].palettes
], () => {
  updatePalette();
}, { deep: true });

function updatePalette() {
  if (pixiMethods.value.updatePalette) pixiMethods.value.updatePalette();
}

watch([
  () => state.cameraDirection,
  () => state.selectedCell
], () => {
  triggerDungeonViewUpdate();
}, { deep: true });

function triggerDungeonViewUpdate() {
  if (pixiMethods.value.triggerDungeonViewUpdate) pixiMethods.value.triggerDungeonViewUpdate();
}
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