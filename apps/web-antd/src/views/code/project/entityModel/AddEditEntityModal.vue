<!--新增编辑实体Modal-->
<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  type CreateEntityModelInput,
  postEntityModelsCreateEntityModel,
  postEntityModelsUpdateEntityModel,
  type UpdateEntityModelInput,
} from '#/api-client/index';
import { $t } from '#/locales';

const emit = defineEmits(['getTreeData']);
const data = ref<Record<string, any>>({});
const [AddForm, addFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      fieldName: 'code',
      label: '编码',
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: '描述',
      rules: 'required',
    },
    {
      component: 'Select',
      fieldName: 'relationalType',
      label: '关系',
      rules: 'required',
      componentProps: {
        options: [
          { label: '一对一', value: '10' },
          { label: '一对多', value: '20' },
        ],
      },
    },
  ],
  wrapperClass: 'grid-cols-1',
  showDefaultActions: false,
});

const [EditForm, editFormApi] = useVbenForm({
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
      component: 'Textarea',
      fieldName: 'description',
      label: '描述',
      rules: 'required',
    },
    {
      component: 'Select',
      fieldName: 'relationalType',
      label: '关系',
      rules: 'required',
      componentProps: {
        options: [
          { label: '一对一', value: '10' },
          { label: '一对多', value: '20' },
        ],
      },
      dependencies: {
        triggerFields: ['relationalType'],
        if: () => !data.value.isRoot,
      },
    },
  ],
  wrapperClass: 'grid-cols-1',
  showDefaultActions: false,
});
const [Modal, modalApi] = useVbenModal({
  onOpenChange: (isOpen: boolean) => {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      if (data.value.isEdit) {
        const { row } = data.value;
        editFormApi.setValues({
          ...row,
          relationalType: String(row.relationalType),
        });
      }
    }
  },
  onConfirm: async () => {
    try {
      modalApi.setState({ loading: true, confirmLoading: true });
      if (data.value.isEdit) {
        const { valid } = await editFormApi.validate();
        if (!valid) return;
        const editFormValues = await editFormApi.getValues();
        const params = {
          ...editFormValues,
          id: data.value.id,
        } as UpdateEntityModelInput;
        data.value.isRoot && delete params.relationalType;
        await postEntityModelsUpdateEntityModel({
          body: params,
        });
      } else {
        const { valid } = await addFormApi.validate();
        if (!valid) return;
        const addFormValues = await addFormApi.getValues();
        await postEntityModelsCreateEntityModel({
          body: {
            ...addFormValues,
            id: data.value.id,
          } as CreateEntityModelInput,
        });
        message.success($t('common.addSuccess'));
      }
      modalApi.close();
      emit('getTreeData');
    } finally {
      modalApi.setState({ loading: false, confirmLoading: false });
    }
  },
});
</script>
<template>
  <Modal :title="data.isEdit ? $t('common.edit') : $t('common.add')">
    <component :is="data.isEdit ? EditForm : AddForm" />
  </Modal>
</template>
