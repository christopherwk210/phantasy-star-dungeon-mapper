<script setup lang="ts">
import { createPopper } from '@popperjs/core';
import { useState } from '@/store';
import { watch, ref, onMounted, nextTick, computed } from 'vue';
import type { PhantasyStar } from '@/map.interface';

const { state, getCell } = useState();
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
};

const contextCell = computed(() => getCell(state.contextCell.x, state.contextCell.y));

interface Item {
  name: string;
  action(cell: PhantasyStar.MapCell): void;
}

const items: Item[] = [
  {
    name: 'Clear',
    action: cell => cell.type = 'open'
  },
  {
    name: 'Mark as stairs',
    action: cell => {
      cell.type = 'stairs';
      (cell as PhantasyStar.MapCellStairs).destination = '';
      (cell as PhantasyStar.MapCellStairs).stairsType = 'up';
    }
  },
  {
    name: 'Mark as chest',
    action: cell => {
      cell.type = 'chest';
      (cell as PhantasyStar.MapCellChest).trapType = 'none';
      (cell as PhantasyStar.MapCellChest).reward = '';
    }
  },
  {
    name: 'Mark as door',
    action: cell => {
      cell.type = 'door';
      (cell as PhantasyStar.MapCellDoor).destination = '';
      (cell as PhantasyStar.MapCellDoor).doorType = 'door';
    }
  },
  {
    name: 'Mark as trap',
    action: cell => cell.type = 'trap'
  },
  {
    name: 'Mark as enemy',
    action: cell => {
      cell.type = 'enemy';
      (cell as PhantasyStar.MapCellEnemy).enemyType = '' as any;
      (cell as PhantasyStar.MapCellEnemy).reward = '';
    }
  }
];

window.addEventListener('contextmenu', e => e.preventDefault());

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
          offset: [0, 0],
        }
      },
    ],
  });
  
  watch(() => state.contextCell, async () => {
    dismissable.value = false;

    virtualElement.getBoundingClientRect = generateGetBoundingClientRect(
      state.contextCell.screenX,
      state.contextCell.screenY,
      state.cellSize,
      state.cellSize
    );

    popper.update();

    setTimeout(() => {
      dismissable.value = state.contextCell.visible;
    }, 100);
  }, { deep: true });
});

function canShowItem(item: Item) {
  if (!contextCell.value) return false;
  if (item.name === 'Clear' && (contextCell.value.type === 'open' || contextCell.value.type === 'wall')) return false;
  return true;
}
</script>

<template>
  <div ref="cellMenu" class="bg-secondary text-white" :style="{ display: state.contextCell.visible ? 'block' : 'none' }" id="cellMenu">
    <div class="text-white-50 px-2 py-1 bg-dark">Cell ({{ state.contextCell.x }}, {{ state.contextCell.y }})</div>
    <template v-for="item of items">
      <div v-if="canShowItem(item)" class="px-2 py-1 cursor-pointer menu-item" >
        {{ item.name }}
      </div>
    </template>
  </div>
</template>

<style scoped>
  #cellMenu {
    position: absolute;
    box-shadow: 0 2px 4px 2px rgba(0,0,0,0.33);
  }

  .menu-item:hover {
    background-color: rgba(2, 123, 211, 0.75);
  }
</style>