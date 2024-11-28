<script lang="ts" setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useVbenModal } from '@vben/common-ui';

import { useVbenForm, z } from '#/adapter/form';
import { postOrganizationUnitsCreate } from '#/api-client/index';
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
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: $t('common.pleaseInput'),
        disabled: true,
      },
      // 字段名
      fieldName: 'parentDisplayName',
      // 界面显示的label
      label: '上级组织机构',
    },
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
      formApi.setValues(data.value);
    }
  },
  onConfirm: async () => {
    try {
      modalApi.setState({ loading: true, confirmLoading: true });
      const { valid } = await formApi.validate();
      if (!valid) return;
      const values = await formApi.getValues();
      await postOrganizationUnitsCreate({
        body: {
          ...data.value,
          ...values,
        },
      });
      modalApi.close();
      ElMessage({
        message: $t('common.addSuccess'),
        type: 'success',
      });
      emit('getTreeData');
    } finally {
      modalApi.setState({ loading: false, confirmLoading: false });
    }
  },
});
</script>
<template>
  <Modal :title="$t('common.add')">
    <Form />
  </Modal>
</template>
