<script lang="ts" setup>
import type { PropType } from 'vue';

import { Spin } from 'ant-design-vue';

import { SizeEnum } from './typing';

defineOptions({ name: 'Loading' });

defineProps({
  tip: {
    type: String as PropType<string>,
    default: '',
  },
  size: {
    type: String as PropType<SizeEnum>,
    default: SizeEnum.LARGE,
    validator: (v: SizeEnum): boolean => {
      return [SizeEnum.DEFAULT, SizeEnum.LARGE, SizeEnum.SMALL].includes(v);
    },
  },
  absolute: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  loading: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  background: {
    type: String as PropType<string>,
  },
  theme: {
    type: String as PropType<'dark' | 'light'>,
  },
});
</script>
<template>
  <section
    v-show="loading"
    :class="{ absolute, [`${theme}`]: !!theme }"
    :style="[background ? `background-color: ${background}` : '']"
    class="full-loading"
  >
    <Spin v-bind="$attrs" :size="size" :spinning="loading" :tip="tip" />
  </section>
</template>
<style lang="less" scoped>
.full-loading {
  display: flex;
  position: fixed;
  z-index: 200;
  top: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f0f2f566;

  &.absolute {
    position: absolute;
    z-index: 300;
    top: 0;
    left: 0;
  }
}

html[data-theme='dark'] {
  .full-loading:not(.light) {
    background-color: rgba(0, 0, 0, 0.5);
  }
}

.full-loading.dark {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
