<script setup lang="ts">
import type { PhantasyStar } from '@/map.interface';
import { enemies } from '@/map.interface';
import { useState } from '@/store';
import { computed } from 'vue';

const { state, getCell } = useState();

const selectedCell = computed(() => {
  if (state.contextCell.selected) {
    return getCell(state.contextCell.x, state.contextCell.y);
  } else {
    return undefined;
  }
});

const cellTypes: PhantasyStar.MapCell['type'][] = [
  'chest',
  'door',
  'enemy',
  'npc',
  'open',
  'stairs',
  'trap',
  'wall'
];

const chestTrapTypes: PhantasyStar.MapCellChest['trapType'][] = [
  'bomb',
  'none',
  'spear'
];

const doorTypes: PhantasyStar.MapCellDoor['doorType'][] = [
  'dungeon door',
  'magic door',
  'normal'
];

const npcTypes: PhantasyStar.MapCellNpc['npcType'][] = ['normal', 'room'];
const stairsTypes: PhantasyStar.MapCellStairs['stairsType'][] = ['down', 'up'];
</script>

<template>
  <div class="tab-inspector p-2 d-flex flex-column">
    <template v-if="selectedCell">
      <div class="text-center mb-3">Position: <em>({{ state.contextCell.x }}, {{ state.contextCell.y }})</em></div>
      <div class="mb-1">Cell type:</div>
      <select v-model="selectedCell.type" class="form-control text-light border-light text-center bg-dark mb-3">
        <option v-for="cellType of cellTypes" :value="cellType">{{ cellType }}</option>
      </select>

      <!-- Chest -->
      <template v-if="selectedCell.type === 'chest'">
        <div class="mb-1">Trap:</div>
        <select v-model="selectedCell.trapType" class="form-control text-light border-light text-center bg-dark">
          <option v-for="trapType of chestTrapTypes" :value="trapType">{{ trapType }}</option>
        </select>

        <div class="mb-1 mt-3">Reward:</div>
        <input type="text" class="form-control text-light border-light bg-dark" v-model="selectedCell.reward">
      </template>

      <!-- Door -->
      <template v-if="selectedCell.type === 'door'">
        <div class="mb-1">Door type:</div>
        <select v-model="selectedCell.doorType" class="form-control text-light border-light text-center bg-dark">
          <option v-for="doorType of doorTypes" :value="doorType">{{ doorType }}</option>
        </select>

        <div class="mb-1 mt-3">Destination:</div>
        <input type="text" class="form-control text-light border-light bg-dark" v-model="selectedCell.destination">
      </template>

      <!-- Enemy -->
      <template v-if="selectedCell.type === 'enemy'">
        <div class="mb-1">Enemy type:</div>
        <select v-model="selectedCell.enemyType" class="form-control text-light border-light text-center bg-dark">
          <option v-for="enemy of enemies" :value="enemy">{{ enemy }}</option>
        </select>

        <div class="mb-1 mt-3">Reward:</div>
        <input type="text" class="form-control text-light border-light bg-dark" v-model="selectedCell.reward">
      </template>

      <!-- NPC -->
      <template v-if="selectedCell.type === 'npc'">
        <div class="mb-1">NPC type:</div>
        <select v-model="selectedCell.npcType" class="form-control text-light border-light text-center bg-dark">
          <option v-for="npcType of npcTypes" :value="npcType">{{ npcType }}</option>
        </select>

        <div class="mb-1 mt-3">Name:</div>
        <input type="text" class="form-control text-light border-light bg-dark" v-model="selectedCell.name">

        <div class="mb-1 mt-3">Notes:</div>
        <input type="text" class="form-control text-light border-light bg-dark" v-model="selectedCell.notes">
      </template>

      <!-- Stairs -->
      <template v-if="selectedCell.type === 'stairs'">
        <div class="mb-1">Direction:</div>
        <select v-model="selectedCell.stairsType" class="form-control text-light border-light text-center bg-dark">
          <option v-for="stairType of stairsTypes" :value="stairType">{{ stairType }}</option>
        </select>

        <div class="mb-1 mt-3">Destination:</div>
        <input type="text" class="form-control text-light border-light bg-dark" v-model="selectedCell.destination">
      </template>
    </template>

    <template v-else>
      <div class="text-center mb-3">No cell selected.</div>
      <div class="text-center">Use <em>Shift + left click</em> to select a cell.</div>
    </template>
  </div>
</template>

<style scoped>
  em {
    font-style: normal;
    color: white;
  }
</style>