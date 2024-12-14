<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  postDataDictionaryCreateDetail,
  postDataDictionaryUpdateDetail,
} from '#/api-client/index';
import { $t } from '#/locales';

defineOptions({
  name: 'DataDictionaryDetailModal',
});

const emit = defineEmits(['reload']);
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
        disabled: true,
      },
      fieldName: 'typeDisplayText',
      label: $t('abp.dataDictionary.type'),
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: $t('common.pleaseInput'),
      },
      // 字段名
      fieldName: 'code',
      // 界面显示的label
      label: $t('abp.dataDictionary.code'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('common.pleaseInput'),
      },
      fieldName: 'displayText',
      label: $t('abp.dataDictionary.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('common.pleaseInput'),
      },
      fieldName: 'order',
      label: $t('abp.dataDictionary.order'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('common.pleaseInput'),
        type: 'textarea',
      },
      fieldName: 'description',
      label: $t('abp.dataDictionary.description'),
    },
  ],
  wrapperClass: 'grid-cols-1',
});
const [Modal, modalApi] = useVbenModal({
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      if (data.value.isEdit) {
        formApi.setValues({
          ...data.value.row,
          typeDisplayText: data.value.type,
        });
      } else {
        formApi.setValues({ typeDisplayText: data.value.type });
      }
    }
  },
  onConfirm: async () => {
    try {
      modalApi.setState({ loading: true, confirmLoading: true });
      const { valid } = await formApi.validate();
      if (!valid) return;
      const values = await formApi.getValues();
      await (data.value.isEdit
        ? postDataDictionaryUpdateDetail({
            body: {
              ...values,
              id: data.value.row.id,
              dataDictionaryId: data.value.id,
            },
          })
        : postDataDictionaryCreateDetail({
            body: { ...values, id: data.value.id },
          }));
      emit('reload');
      modalApi.close();
    } finally {
      modalApi.setState({ loading: false, confirmLoading: false });
    }
  },
});
</script>
<template>
  <Modal :title="data.isEdit ? $t('common.edit') : $t('common.add')">
    <Form />
  </Modal>
</template>
