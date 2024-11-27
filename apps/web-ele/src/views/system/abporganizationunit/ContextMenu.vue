<script setup lang="ts">
import { defineEmits, defineProps } from 'vue';
import {
  ElButton as Button,
  ElDropdownMenu as Menu,
  ElDropdownItem as MenuItem,
 
} from 'element-plus';

defineProps({
  x: Number,
  y: Number,
  options: Array,
});

const emit = defineEmits(['select', 'close']);
</script>

<template>
  <div
    :style="{ left: `${x}px`, top: `${y}px` }"
    class="context-menu"
    @click.stop
  >
    <Menu mode="vertical">
      <MenuItem
        v-for="option in options"
        :key="option.key"
        @click.stop="$emit('select', option.key)"
      >
        <Button size="small" type="link"> {{ option.label }} </Button>
      </MenuItem>
    </Menu>
  </div>
</template>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 1000;
  background: white;
  box-shadow: 2px 2px 5px rgb(0 0 0 / 10%);
}

ul {
  padding: 0;
  margin: 0;
  list-style-type: none;
}

li {
  padding: 8px 12px;
  cursor: pointer;
}

li:hover {
  background-color: #f0f0f0;
}
</style>
