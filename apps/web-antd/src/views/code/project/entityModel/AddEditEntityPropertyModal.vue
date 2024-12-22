<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  type CreateEntityModelPropertyInput,
  postDataTypesList,
  postEntityModelsCreateEntityModelProperty,
  postEntityModelsUpdateEntityModelProperty,
  type UpdateEntityModelPropertyInput,
} from '#/api-client/index';
import { $t } from '#/locales';

const emit = defineEmits(['reload']);
const data = ref<Record<string, any>>({});
const dataTypeList = ref<any[]>();
const currentDataType = ref<string>();
const specialTypeList = new Set(['decimal', 'float']);

// 获取数据类型列表
async function getOptions() {
  const { data: List } = await postDataTypesList({
    body: { entityModelId: data.value.entityModelId },
  });
  dataTypeList.value = List;
  return List;
}
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
      formItemClass: 'col-span-2',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: $t('code.desc'),
      rules: 'required',
      formItemClass: 'col-span-2',
    },
    {
      component: 'Select',
      fieldName: 'dataTypeId',
      label: $t('code.dataType'),
      formItemClass: 'col-span-2',
      componentProps: () => ({
        options: dataTypeList.value,
        'field-names': { label: 'description', value: 'id' },
        onChange: (_value: any, data: Record<string, any>) => {
          currentDataType.value = data.code;
        },
      }),
    },
    {
      component: 'Switch',
      fieldName: 'isRequired',
      label: $t('code.isRequired'),
      defaultValue: true,
      formItemClass: 'col-span-2 w-[100px]',
    },
    {
      component: 'InputNumber',
      fieldName: 'maxLength',
      label: $t('code.maxLength'),
      rules: 'required',
      defaultValue: 128,
      dependencies: {
        triggerFields: ['dataTypeId'],
        if: () => currentDataType.value === 'string',
      },
      formItemClass: 'col-span-1',
    },
    {
      component: 'InputNumber',
      fieldName: 'minLength',
      label: $t('code.minLength'),
      defaultValue: 0,
      dependencies: {
        triggerFields: ['dataTypeId'],
        if: () => currentDataType.value === 'string',
      },
      componentProps: {
        min: 0,
      },
      formItemClass: 'col-span-1',
    },
    {
      component: 'InputNumber',
      fieldName: 'decimalPrecision',
      label: $t('code.decimalPrecision18'),
      componentProps: {
        max: 18,
      },
      dependencies: {
        triggerFields: ['dataTypeId'],
        if: () => specialTypeList.has(currentDataType.value as string),
      },
      formItemClass: 'col-span-1',
    },
    {
      component: 'InputNumber',
      fieldName: 'decimalScale',
      label: $t('code.decimalPrecision6'),
      dependencies: {
        triggerFields: ['dataTypeId'],
        if: () => specialTypeList.has(currentDataType.value as string),
      },
      componentProps: {
        max: 18,
      },
      formItemClass: 'col-span-1',
    },
  ],
  wrapperClass: 'grid-cols-2',
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      try {
        modalApi.setState({ loading: true });
        data.value = modalApi.getData<Record<string, any>>();
        await getOptions();
        if (data.value.isEdit) {
          formApi.setValues({ ...data.value.row });
          currentDataType.value = data.value.row.dataTypeCode;
        }
      } finally {
        modalApi.setState({ loading: false });
      }
    }
  },
  onConfirm: async () => {
    try {
      modalApi.setState({ loading: true, confirmLoading: true });
      const { valid } = await formApi.validate();
      if (!valid) return;
      const addFormValues = await formApi.getValues();
      await (data.value.isEdit
        ? postEntityModelsUpdateEntityModelProperty({
            body: {
              ...addFormValues,
              id: data.value.entityModelId,
              propertyId: data.value.row.id,
              enumTypeId: addFormValues.dataTypeId,
            } as UpdateEntityModelPropertyInput,
          })
        : postEntityModelsCreateEntityModelProperty({
            body: {
              ...addFormValues,
              id: data.value.entityModelId,
              enumTypeId: addFormValues.dataTypeId,
            } as CreateEntityModelPropertyInput,
          }));
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
