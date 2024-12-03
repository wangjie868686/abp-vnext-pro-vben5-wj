<!--新增编辑实体Modal-->
<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { postEntityModelsCreateEntityModel, postEntityModelsUpdateEntityModel, type CreateEntityModelInput, type UpdateEntityModelInput } from '#/api-client/index';

const emit = defineEmits(['getTreeData']);

const data = ref<Record<string, any>>({});
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
    if (data.value.isEdit) {
      const { valid } = await editFormApi.validate();
      if (!valid) return;
      const editFormValues = await editFormApi.getValues();
      const params = {
        ...editFormValues,
        id: data.value.id
      } as UpdateEntityModelInput;
      data.value.isRoot && delete params.relationalType;
      await postEntityModelsUpdateEntityModel({
        body: params
      })
    } else {
      const { valid } = await addFormApi.validate();
      if (!valid) return;
      const addFormValues = await addFormApi.getValues();
      await postEntityModelsCreateEntityModel({
        body: {
          ...addFormValues,
          id: data.value.id
        } as CreateEntityModelInput,
      });
      message.success('新增成功');
    }
    modalApi.close();
    emit('getTreeData');
  }
});

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
        ]
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
        ]
      },
      dependencies: {
        triggerFields: ['relationalType'],
        if: () => !data.value.isRoot
      }
    },
  ],
  wrapperClass: 'grid-cols-1',
  showDefaultActions: false,
});

</script>
<template>
  <Modal :title="data.isEdit ? '编辑实体' : '新增实体'" "> 
    <component :is="data.isEdit ? EditForm : AddForm" />
  </Modal>
</template>
