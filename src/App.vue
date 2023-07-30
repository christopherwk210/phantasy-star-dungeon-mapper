<script setup lang="ts">
import { RouterView } from 'vue-router';
import { state } from '@/store';
import localforage from 'localforage';
import NavBar from './components/NavBar.vue';
import { onMounted } from 'vue';

onMounted(async () => {
  try {
    const loadedStateString: any = await localforage.getItem('psdm_state');
    const loadedState = JSON.parse(loadedStateString);
    
    state.cameraDirection = loadedState.cameraDirection;
    state.contextCell = loadedState.contextCell;
    state.currentDungeon = loadedState.currentDungeon;
    state.currentFloor = loadedState.currentFloor;
    state.currentMapValid = loadedState.currentMapValid;
    state.dungeons = loadedState.dungeons;
    state.selectedTab = loadedState.selectedTab;
    state.selectedCell.x = -1;
    state.selectedCell.y = -1;

    state.contextCell.selected = false;
    state.contextCell.visible = false;
  } catch (e) {}

  setInterval(() => {
    localforage.setItem('psdm_state', JSON.stringify(state));
  }, 1000);
});

window.addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    if ((e.target as HTMLElement).tagName === 'SELECT') {
      e.preventDefault();
    }
  }
});
</script>

<template>
  <NavBar />
  <RouterView />
</template>