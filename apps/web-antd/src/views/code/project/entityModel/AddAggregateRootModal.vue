<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { postEntityModelsCreateAggregate } from '#/api-client/index';
import { $t } from '#/locales';

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(['getTreeData']);
const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  showDefaultActions: false,
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('common.pleaseInput'),
      },
      fieldName: 'code',
      label: '编码',
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: $t('common.pleaseInput'),
      },
      fieldName: 'description',
      label: $t('common.description'),
      rules: 'required',
    },
  ],
  wrapperClass: 'grid-cols-1',
});
const [Modal, modalApi] = useVbenModal({
  onConfirm: async () => {
    try {
      modalApi.setState({ loading: true, confirmLoading: true });
      const { valid } = await formApi.validate();
      if (!valid) return;
      const values = await formApi.getValues();
      await postEntityModelsCreateAggregate({
        body: {
          code: values.code,
          description: values.description,
          projectId: props.projectId,
        },
      });
      message.success($t('common.addSuccess'));
      emit('getTreeData');
      modalApi.close();
    } finally {
      modalApi.setState({ loading: false, confirmLoading: false });
    }
  },
});
</script>
<template>
  <Modal title="新增聚合根">
    <Form />
  </Modal>
</template>
