<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { postTenantsAddOrUpdateConnectionString } from '#/api-client';
import { ElMessage } from 'element-plus';
import { $t } from '#/locales';

const emit = defineEmits(['reload']);
const props = defineProps({
  id: String,
})
const [Modal, modaApi] = useVbenModal({
  onConfirm: async () => {
    const { valid } = await formApi.validate();
    if (!valid) return;
    try {
      const formValues = await formApi.getValues();
      modaApi.setState({ loading: true, confirmLoading: true });
      await postTenantsAddOrUpdateConnectionString({
        body: { ...formValues, id: props.id },
      });
      ElMessage({
        type:'success',
        message: $t('common.success'),
      })
      modaApi.close();
      emit('reload');
    } finally {
      modaApi.setState({ loading: false, confirmLoading: false });
    }
  }
});
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  schema: [{
    component: 'Input',
    componentProps: {
    },
    fieldName: 'name',
    label: '名称',
    rules: 'required',
  }, {
    component: 'Input',
    componentProps: {
    },
    fieldName: 'value',
    label: '连接字符串',
    rules: 'required',
  }],
  layout: 'horizontal',
  wrapperClass: 'grid-cols-1',
});
</script>
<template>
  <Modal title="新增或编辑">
    <Form />
  </Modal>
</template>
