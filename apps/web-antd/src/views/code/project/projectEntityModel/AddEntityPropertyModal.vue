<!--新增编辑实体属性Modal-->
<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import {
  postEntityModelsCreateEntityModelProperty,
  postDataTypesList,
  type CreateEntityModelPropertyInput,
} from '#/api-client/index';

const emit = defineEmits(['reload-property-grid']);

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
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      modalApi.setState({ loading: true });
      data.value = modalApi.getData<Record<string, any>>();
      await getOptions();
      modalApi.setState({ loading: false });
    }
  },
  onConfirm: async () => {
    try {
      modalApi.setState({ loading: true, confirmLoading: true });
        const { valid } = await addFormApi.validate();
        if (!valid) return;
        const addFormValues = await addFormApi.getValues();
        await postEntityModelsCreateEntityModelProperty({
          body: {
            ...addFormValues,
            id: data.value.entityModelId
          } as CreateEntityModelPropertyInput,
        });
        message.success('新增成功');
        modalApi.close();
        emit('reload-property-grid');
    } finally {
      modalApi.setState({ loading: false, confirmLoading: false });
    }
  }
});

const currentDataType = ref<string>();
const specialTypeList= ['decimal', 'float']
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
      formItemClass: 'col-span-2',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: '描述',
      rules: 'required',
      formItemClass: 'col-span-2',
    },
    {
      component: 'Select',
      fieldName: 'dataTypeId',
      label: '数据类型',
      formItemClass: 'col-span-2',
      componentProps: () => ({
        options: dataTypeList.value,
        'field-names': { label: 'description', value: 'id' },
        onChange: (_value: any, data: Record<string, any>) => {
          currentDataType.value = data.code;
        }
      }),
    },
    {
      component: 'Switch',
      fieldName: 'isRequired',
      label: '必填',
      formItemClass: 'col-span-2 w-[100px]',
    },
    {
      component: 'InputNumber',
      fieldName: 'maxLength',
      label: '最大长度',
      rules: 'required',
      dependencies: {
        triggerFields: ['dataTypeId'],
        if: () => currentDataType.value === 'string'
      },
      formItemClass: 'col-span-1',
    },
    {
      component: 'InputNumber',
      fieldName: 'minLength',
      label: '最小长度',
      dependencies: {
        triggerFields: ['dataTypeId'],
        if: () => currentDataType.value === 'string'
      },
      componentProps: {
        min: 1,
      },
      formItemClass: 'col-span-1',
    },
    {
      component: 'InputNumber',
      fieldName: 'decimalPrecision',
      label: '精度(18,6)的18',
      componentProps: {
        max: 18,
      },
      dependencies: {
        triggerFields: ['dataTypeId'],
        if: () => specialTypeList.includes(currentDataType.value as string)
      },
      formItemClass: 'col-span-1',
    },
    {
      component: 'InputNumber',
      fieldName: 'decimalScale',
      label: '精度(18,6)的6',
      dependencies: {
        triggerFields: ['dataTypeId'],
        if: () => specialTypeList.includes(currentDataType.value as string)
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


</script>
<template>
  <Modal :title="data.isEdit ? '编辑实体属性' : '新增实体属性'" "> 
    <AddForm>
    </AddForm>
  </Modal>
</template>
