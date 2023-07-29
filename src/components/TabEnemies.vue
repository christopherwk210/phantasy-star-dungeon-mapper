<script setup lang="ts">
import type { PhantasyStar } from '@/map.interface';
import { enemies } from '@/map.interface';
import { useState } from '@/store';
import { ref } from 'vue';

const { state, currentFloor } = useState();

const selectedEnemy = ref<PhantasyStar.Enemy>('Ammonite');
const selectedFloorEnemy = ref<string>('');

function add() {
  if (!selectedEnemy.value) return;
  if (currentFloor.value.enemyList.includes(selectedEnemy.value)) return;
  currentFloor.value.enemyList.push(selectedEnemy.value);
}

function remove() {
  if (!selectedFloorEnemy.value) return;
  const index = currentFloor.value.enemyList.indexOf(selectedFloorEnemy.value as any);
  if (index === -1) return;
  currentFloor.value.enemyList.splice(index, 1);
}
</script>

<template>
  <div class="tab-enemies p-2 d-flex flex-column flex-1">
    <div>Current floor enemies:</div>
    <select v-model="selectedFloorEnemy" size="2" class="form-control text-light border-light text-center bg-dark flex-1">
      <option v-for="enemy of currentFloor.enemyList" :value="enemy">{{ enemy }}</option>
    </select>
    <button @click="remove()" class="btn btn-outline-danger mt-2">Remove</button>

    <div class="mt-3">Enemy list:</div>
    <select v-model="selectedEnemy" size="2" class="form-control text-light border-light text-center bg-dark flex-50">
      <option v-for="enemy of enemies" :value="enemy">{{ enemy }}</option>
    </select>
    <button @click="add()" class="btn btn-outline-primary mt-2">Add</button>
  </div>
</template>

<style scoped>
  em {
    font-style: normal;
    color: white;
  }

  .flex-1 {
    flex: 1;
  }

  .flex-50 {
    flex: 0.5;
  }
</style>