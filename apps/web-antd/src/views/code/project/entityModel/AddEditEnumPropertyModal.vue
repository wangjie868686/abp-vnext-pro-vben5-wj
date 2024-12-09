<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  type CreateEnumTypePropertyInput,
  postEnumTypesCreateEnumTypeProperty,
  postEnumTypesUpdateEnumTypeProperty,
  type UpdateEnumTypePropertyInput,
} from '#/api-client/index';

const emit = defineEmits(['reload']);
const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      fieldName: 'code',
      label: '编码',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'value',
      label: '值',
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: '描述',
      rules: 'required',
    },
  ],
  wrapperClass: 'grid-cols-1',
  showDefaultActions: false,
});
const data = ref<Record<string, any>>({});
const [Modal, modalApi] = useVbenModal({
  onOpenChange: (isOpen: boolean) => {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      if (data.value.isEdit) {
        const { row } = data.value;
        formApi.setValues({
          ...row,
        });
      }
    }
  },
  onConfirm: async () => {
    try {
      modalApi.setState({ loading: true, confirmLoading: true });
      const { valid } = await formApi.validate();
      if (!valid) return;
      const formValues = await formApi.getValues();
      if (data.value.isEdit) {
        const params = {
          ...formValues,
          id: data.value.row.id,
        };
        await postEnumTypesUpdateEnumTypeProperty({
          body: params as UpdateEnumTypePropertyInput,
        });
      } else {
        await postEnumTypesCreateEnumTypeProperty({
          body: {
            ...formValues,
            ...data.value,
          } as CreateEnumTypePropertyInput,
        });
      }
      message.success(data.value.isEdit ? '编辑成功' : '新增成功');
      modalApi.close();
      emit('reload');
    } finally {
      modalApi.setState({ loading: false, confirmLoading: false });
    }
  },
});
</script>

<template>
  <Modal :title="data.isEdit ? '编辑枚举属性' : '新增枚举属性'">
    <Form />
  </Modal>
</template>
