<!--新增编辑实体属性Modal-->
<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import {
  postEntityModelsCreateEntityModel,
  postDataTypesList,
  type CreateEntityModelInput,
} from '#/api-client/index';

const emit = defineEmits(['getTreeData']);

const data = ref<Record<string, any>>({});
const dataTypeList = ref<any[]>();

// 获取数据类型列表
async function getOptions() {
  const { data: List } = await postDataTypesList({ body: { entityModelId: data.value.entityModelId }});
  dataTypeList.value = List;
  console.log(dataTypeList.value)
  return List;
}


const [Modal, modalApi] = useVbenModal({
  onOpenChange: (isOpen: boolean) => {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      getOptions();
    }
  },
  onConfirm: async () => {
    try {
      modalApi.setState({ loading: true, confirmLoading: true });
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
      modalApi.close();
      emit('getTreeData');
    } finally {
      modalApi.setState({ loading: false, confirmLoading: false });
    }
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
      fieldName: 'dataTypeId',
      label: '数据类型',
      componentProps: () => ({
        options: dataTypeList.value,
        'field-names': { label: 'description', value: 'id' }
      }),
    },
    {
      component: 'Switch',
      fieldName: 'isRequired',
      label: '必填',
      formItemClass: 'w-[100px]'
    },
  ],
  wrapperClass: 'grid-cols-1',
  showDefaultActions: false,
});


</script>
<template>
  <Modal :title="data.isEdit ? '编辑实体' : '新增实体'" "> 
    <AddForm>
    </AddForm>
  </Modal>
</template>
