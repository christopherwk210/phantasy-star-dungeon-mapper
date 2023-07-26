<script setup lang="ts">
import { useState } from '@/store';

const paletteMapping = [
  'Green',
  'Dark blue',
  'Blue',
  'Purple',
  'Yellow',
  'Golden',
  'Black & blue',
  'Light blue',
  'Red',
  'Orange',
  'Dark green'
];

const { currentDungeon } = useState();
</script>

<template>
  <div class="tab-dungeon-config p-2">
    <label>Name</label>
    <input type="text" class="form-control text-light border-light text-center bg-dark" v-model="currentDungeon.name">
    
    <label class="mt-3">Floors palette</label>
    <select v-model="currentDungeon.palettes.floors" class="form-control text-light border-light text-center bg-dark">
      <option v-for="(palette, paletteIndex) of paletteMapping" :value="paletteIndex">{{ palette }}</option>
    </select>

    <label class="mt-3">Walls palette</label>
    <select v-model="currentDungeon.palettes.walls" class="form-control text-light border-light text-center bg-dark">
      <option v-for="(palette, paletteIndex) of paletteMapping" :value="paletteIndex">{{ palette }}</option>
    </select>
  </div>
</template>