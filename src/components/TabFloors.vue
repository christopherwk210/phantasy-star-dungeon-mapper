<script setup lang="ts">
import { useState, blankFloor } from '@/store';

const { currentDungeon, currentFloor, state } = useState();

function addNewFloor() {
  const newFloor = JSON.parse(JSON.stringify(blankFloor));
  currentDungeon.value.floors.push(newFloor);
  state.currentFloor = currentDungeon.value.floors.length - 1;
}

function copyFloor() {
  const newFloor = JSON.parse(JSON.stringify(currentFloor.value));
  currentDungeon.value.floors.push(newFloor);
  state.currentFloor = currentDungeon.value.floors.length - 1;
}

function deleteFloor() {
  if (currentDungeon.value.floors.length === 1) {
    alert('You must have at least one floor.');
    return;
  }

  currentDungeon.value.floors.splice(state.currentFloor, 1);
  state.currentFloor = 0;
}

function moveFloorUp() {
  if (state.currentFloor === 0) {
    return;
  }

  const floor = currentDungeon.value.floors.splice(state.currentFloor, 1)[0];
  currentDungeon.value.floors.splice(state.currentFloor - 1, 0, floor);
  state.currentFloor--;
}

function moveFloorDown() {
  if (state.currentFloor === currentDungeon.value.floors.length - 1) {
    return;
  }

  const floor = currentDungeon.value.floors.splice(state.currentFloor, 1)[0];
  currentDungeon.value.floors.splice(state.currentFloor + 1, 0, floor);
  state.currentFloor++;
}
</script>

<template>
  <div class="tab-floors p-2">
    <div class="buttons mb-2">
      <button @click="addNewFloor()" class="btn btn-outline-primary">Add</button>
      <button @click="copyFloor()" class="btn btn-outline-primary">Copy</button>
      <button @click="deleteFloor()" class="btn btn-outline-danger">Delete</button>
    </div>
    <div class="buttons mb-2">
      <button @click="moveFloorUp()" class="btn btn-outline-primary">Move up</button>
      <button @click="moveFloorDown()" class="btn btn-outline-primary">Move down</button>
    </div>
    <div class="list-group list-group-flush border">
      <a @click="state.currentFloor = floorIndex" v-for="(floor, floorIndex) of currentDungeon.floors" :class="[floorIndex === state.currentFloor ? 'bg-primary' : 'bg-secondary']" class="cursor-pointer list-group-item list-group-item-action text-light user-select-none">
        <p class="m-0">Floor {{ floorIndex + 1 }}</p>
      </a>
    </div>
  </div>
</template>


<style scoped>
  .tab-floors {
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