<script setup lang="ts">
import { useState, blankDungeon } from '@/store';
import type { PhantasyStar } from '@/map.interface';

const { state, currentDungeon } = useState();

function addNewDungeon() {
  const newDungeon: PhantasyStar.Dungeon = JSON.parse(JSON.stringify(blankDungeon));
  state.dungeons.push(newDungeon);
  state.currentDungeon = state.dungeons.length - 1;
}

function copyDungeon() {
  const copiedDungeon: PhantasyStar.Dungeon = JSON.parse(JSON.stringify(currentDungeon.value));
  copiedDungeon.name += ' (Copy)';
  state.dungeons.push(copiedDungeon);
  state.currentDungeon = state.dungeons.length - 1;
}

function deleteCurrentDungeon() {
  if (state.dungeons.length === 1) {
    alert('You must have at least one dungeon.');
    return;
  }

  state.dungeons.splice(state.currentDungeon, 1);
  state.currentDungeon = 0;
}
</script>

<template>
  <div class="tab-dungeons p-2">
    <div class="buttons mb-2">
      <button @click="addNewDungeon()" class="btn btn-outline-primary">Add</button>
      <button @click="copyDungeon()" class="btn btn-outline-primary">Copy</button>
      <button @click="deleteCurrentDungeon()" class="btn btn-outline-danger">Delete</button>
    </div>
    <div class="list-group list-group-flush border">
      <a @click="state.currentDungeon = dungeonIndex" v-for="(dungeon, dungeonIndex) of state.dungeons" :class="[dungeonIndex === state.currentDungeon ? 'bg-primary' : 'bg-secondary']" class="cursor-pointer list-group-item list-group-item-action text-light user-select-none">
        <p class="m-0">{{ dungeon.name }}</p>
      </a>
    </div>
  </div>
</template>

<style scoped>
  .tab-dungeons {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .list-group {
    flex: 1;
    overflow: auto;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
  }

  .buttons > button {
    flex: 1;
  }
</style>