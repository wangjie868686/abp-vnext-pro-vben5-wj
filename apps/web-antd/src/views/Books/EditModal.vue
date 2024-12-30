<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { postBooksUpdate } from '#/api-client/index';
import { $t } from '#/locales';

import { editFormSchema } from './schema';

const emit = defineEmits(['reload']);
const data = ref<any>({});
const [Form, formApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  showDefaultActions: false,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  schema: editFormSchema,
  wrapperClass: 'grid-cols-1',
});
const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    try {
      modalApi.setState({ loading: true, confirmLoading: true });
      // 获取表单值
      const values = await formApi.getValues();
      // 编辑
      await postBooksUpdate({ body: { ...values } });
      message.success($t('common.editSuccess'));
      emit('reload');
      modalApi.close();
    } finally {
      modalApi.setState({ loading: false, confirmLoading: false });
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      formApi.setValues(data.value.row);
    }
  },
});
</script>
<template>
  <Modal :title="$t('common.edit')">
    <Form />
  </Modal>
</template>
