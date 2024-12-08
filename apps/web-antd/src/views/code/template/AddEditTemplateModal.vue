<!--新增编辑实体Modal-->
<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { postTemplatesControlType, postTemplatesCreateDetail, postTemplatesUpdateDetail, 
  type CreateEntityModelInput, } from '#/api-client/index';

const emit = defineEmits(['getTreeData']);

const data = ref<Record<string, any>>({});
const controlTypeList = ref<any[]>();

const getControlTypeList = async () => {
  const { data = [] } = await postTemplatesControlType();
  controlTypeList.value = data;
};

const [Modal, modalApi] = useVbenModal({
  onOpenChange: (isOpen: boolean) => {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      getControlTypeList();
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
      modalApi.setState({ loading: true, confirmLoading: true});
      const { valid } = await formApi.validate();
      if (!valid) return;
      const formValues = await formApi.getValues();
      if (data.value.isEdit) {
        await postTemplatesUpdateDetail({
          body: {
            ...formValues,
            templateId: data.value.templateId,
            templateDetailId: data.value.templateDetailId,
          }
        })
        message.success('编辑成功');
      } else {
        await postTemplatesCreateDetail({
          body: {
            ...formValues,
            templateId: data.value.templateId
          },
        });
        message.success('新增成功');
      }
      modalApi.close();
      emit('getTreeData');
    } finally {
      modalApi.setState({ loading: false, confirmLoading: false});
    }
  }
});

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
  {
      component: 'Select',
      fieldName: 'templateType',
      label: '类型',
      componentProps: () => {
        return {
          options: [
            { label: '文件夹', value: 10 },
            { label: '文件', value: 20 },
          ]
        }
      },
    },
    {
      component: 'Select',
      fieldName: 'controlType',
      label: '模板策略',
      componentProps: () => {
        return {
          options: controlTypeList.value,
          fieldNames: { label: 'key', value: 'value' }
        }
      },
      dependencies: {
        triggerFields: ['templateType'],
        if: (values) => {
          return values.templateType === 20;
        }
      }
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '名称',
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


</script>
<template>
  <Modal :title="data.isEdit ? '编辑模板' : '新增模板'" "> 
    <Form />
  </Modal>
</template>
