<script setup lang="ts">
import PixiVue from '@/components/Pixi.vue';
import Sidebar from '@/components/Sidebar.vue';
</script>

<template>
  <main>
    <Sidebar />
    <PixiVue />
  </main>
</template>

<style scoped>
  main {
    display: flex;
    flex: 1;
  }
</style>