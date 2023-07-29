<script setup lang="ts">

</script>

<template>
  <div class="tab-help p-2 d-flex flex-column">
    <label class="mb-3"><em>Left click</em> to toggle cells between open spaces (white) and walls (grey).</label>
    <label class="mb-3">Cells will turn red when they are invalid.</label>
    <label class="mb-3"><em>Scroll wheel</em> to zoom in and out, <em>middle click</em> and drag to pan around.</label>
    <label class="mb-3"><em>Right click</em> to manage a cell.</label>
    <label class="mb-3"><em>Shift + left click</em> to select a cell.</label>
    <label class="mb-3"><em>Ctrl + left click</em> to teleport the dungeon view camera to a cell.</label>
    <label class="mb-3"><em>Tab</em> switches between grid view and dungeon view.</label>
    <label class="mb-3"><em>Arrow keys</em> navigate around the dungeon.</label>
    <hr>
    <label class="mb-2 text-center">
      Made by <a target="_blank" href="https://twitter.com/tophtacular">@tophtacular</a>
    </label>
    <label class="mb-2 text-center">
      Source code on <a target="_blank" href="https://github.com/christopherwk210/phantasy-star-dungeon-mapper">GitHub</a>
    </label>
  </div>
</template>

<style scoped>
  em {
    font-style: normal;
    color: white;
  }
</style>