<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  type CreateEnumTypeInput,
  postEnumTypesCreateEnumType,
  postEnumTypesUpdateEnumType,
  type UpdateEnumTypeInput,
} from '#/api-client/index';
import { $t } from '#/locales';

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
      label: $t('code.code'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: $t('code.desc'),
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
        await postEnumTypesUpdateEnumType({
          body: params as UpdateEnumTypeInput,
        });
      } else {
        await postEnumTypesCreateEnumType({
          body: {
            ...formValues,
            ...data.value,
          } as CreateEnumTypeInput,
        });
      }
      message.success(
        data.value.isEdit ? $t('common.editSuccess') : $t('common.addSuccess'),
      );
      modalApi.close();
      emit('reload');
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
