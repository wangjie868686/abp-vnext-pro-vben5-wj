<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { message as Message } from '#/adapter/naive';
import { postOrganizationUnitsUpdate } from '#/api-client/index';
import { $t } from '#/locales';

const emit = defineEmits(['getTreeData']);
const data = ref<Record<string, any>>({});

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
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('common.pleaseInput'),
      },
      fieldName: 'displayName',
      label: $t('abp.dataDictionary.name'),
      rules: 'required',
    },
  ],
  wrapperClass: 'grid-cols-1',
});
const [Modal, modalApi] = useVbenModal({
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      console.log(data.value);
      formApi.setValues(data.value);
    }
  },
  onConfirm: async () => {
    try {
      modalApi.setState({ loading: true, confirmLoading: true });
      const { valid } = await formApi.validate();
      if (!valid) return;
      const values = await formApi.getValues();
      await postOrganizationUnitsUpdate({
        body: {
          id: data.value.id,
          ...values,
        },
      });
      Message.success($t('common.editSuccess'));
      emit('getTreeData');
      modalApi.close();
    } finally {
      modalApi.setState({ loading: false, confirmLoading: false });
    }
  },
});
</script>
<template>
  <Modal :title="$t('common.edit')">
    <Form />
  </Modal>
</template>
