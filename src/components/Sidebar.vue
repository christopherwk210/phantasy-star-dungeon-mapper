<script setup lang="ts">
import { useState } from '@/store';
import TabDungeonConfig from './TabDungeonConfig.vue';
import TabDungeons from './TabDungeons.vue';
import TabFloors from './TabFloors.vue';
import TabInspector from './TabInspector.vue';
import TabEnemies from './TabEnemies.vue';
import TabHelp from './TabHelp.vue';

const { state, currentTab } = useState();
</script>

<template>
  <div class="tool-card-container">
    <div class="card bg-secondary">
      <div class="card-header bg-primary no-text d-flex">{{ currentTab.name }}</div>
      <div class="card-body text-white-50 bg-secondary p-0">
        <div class="tabs d-flex bg-dark">
          <i v-for="(link, linkIndex) of state.links" @click="state.selectedTab = linkIndex" class="cursor-pointer btn-link text-white-50" :class="{ 'bg-secondary': state.selectedTab === linkIndex }">
            <i :class="[state.selectedTab === linkIndex ? link.selectedIcon : link.icon]"></i>
          </i>
        </div>

        <TabDungeons v-if="state.selectedTab === 0" />
        <TabDungeonConfig v-if="state.selectedTab === 1" />
        <TabFloors v-if="state.selectedTab === 2" />
        <TabInspector v-if="state.selectedTab === 3" />
        <TabEnemies v-if="state.selectedTab === 4" />
        <TabHelp v-if="state.selectedTab === 5" />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .tool-card-container {
    padding: 0;
    max-width: 300px;
    min-width: 300px;
    width: 300px;
    flex-shrink: 0;
  }

  .card {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .card-header {
    position: relative;
  }

  .controls {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
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

  .card-body {
    display: flex;
    flex-direction: column;
  }
</style>