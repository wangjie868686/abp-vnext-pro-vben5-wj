<template>
  <div
    class="context-menu"
    :style="{ left: `${x}px`, top: `${y}px` }"
    @click.stop
  >
    <Menu mode="vertical">
      <Menu.Item
        v-for="option in options"
        :key="option.key"
        @click.stop="$emit('select', option.key)"
      >
        <Button size="small" type="link"> {{ option.label }} </Button>
      </Menu.Item>
    </Menu>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { Menu, Button } from 'ant-design-vue';

defineProps({
  x: Number,
  y: Number,
  options: Array,
});

const emit = defineEmits(['select', 'close']);
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: white;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 8px 12px;
  cursor: pointer;
}

li:hover {
  background-color: #f0f0f0;
}
</style>

