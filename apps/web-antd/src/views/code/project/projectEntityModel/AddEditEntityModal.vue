<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { ref } from 'vue';

const data = ref<Record<string, any>>({});
const [Modal] = useVbenModal();

</script>
<template>
  <Modal :title="data.isEdit ? '编辑实体' : '新增实体'" "> extra modal content </Modal>
</template>
