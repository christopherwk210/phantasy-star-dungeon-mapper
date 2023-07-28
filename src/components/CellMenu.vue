<script setup lang="ts">
import { createPopper } from '@popperjs/core';
import { useState } from '@/store';
import { watch, ref, onMounted, nextTick } from 'vue';

const { state } = useState();
const cellMenu = ref<HTMLDivElement>();
const dismissable = ref(false);

function generateGetBoundingClientRect(x = 0, y = 0, width = 0, height = 0): any {
  return () => ({
    width,
    height,
    top: y,
    right: x,
    bottom: y,
    left: x,
  });
}

const virtualElement = {
  getBoundingClientRect: generateGetBoundingClientRect(0, 0, 32, 32)
}

window.addEventListener('pointerdown', () => {
  if (dismissable.value) {
    state.contextCell.visible = false;
  }
});

onMounted(() => {
  const popper = createPopper(virtualElement, cellMenu.value!, {
    placement: 'right-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 1],
        }
      },
    ],
  });
  
  watch(() => state.contextCell, async () => {
    dismissable.value = false;

    virtualElement.getBoundingClientRect = generateGetBoundingClientRect(
      state.contextCell.screenX,
      state.contextCell.screenY,
      32, 32
    );

    popper.update();

    setTimeout(() => {
      dismissable.value = state.contextCell.visible;
    }, 100);
  }, { deep: true });
});
</script>

<template>
  <div ref="cellMenu" class="bg-secondary text-white" :style="{ display: state.contextCell.visible ? 'block' : 'none' }" id="cellMenu">
    <div class="text-white-50 px-2 py-1">Cell ({{ state.contextCell.x }}, {{ state.contextCell.y }})</div>
    test
  </div>
</template>

<style scoped>
  #cellMenu {
    position: absolute;
  }
</style>