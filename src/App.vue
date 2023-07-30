<script setup lang="ts">
import { RouterView } from 'vue-router';
import NavBar from './components/NavBar.vue';

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