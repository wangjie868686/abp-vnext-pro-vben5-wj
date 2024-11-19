<script lang="ts" setup>
import { ref } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { useVbenForm, z } from '#/adapter/form';
import { postDataDictionaryCreate, postDataDictionaryUpdate, } from '#/api-client/index';


const emit = defineEmits(['reload']);
const data = ref<Record<string, any>>({});
const [Modal, modalApi] = useVbenModal({
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      console.log(data.value);
      if (data.value.isEdit) {
        formApi.setValues({ ...data.value.row });
      }
    }
  },
  onConfirm: async () => {
    try {
      modalApi.setState({ loading: true, confirmLoading: true });
      const { valid } = await formApi.validate();
      if (!valid) return;
      const values = await formApi.getValues();
      if (data.value.isEdit) {
        await postDataDictionaryUpdate({
          body: {
            ...values,
            id: data.value.row.id,
          }
        })
      } else {
         await postDataDictionaryCreate({
          body: values,
        });
      }
      emit('reload');
      modalApi.close();
    } finally {
      modalApi.setState({ loading: false, confirmLoading: false });
    }

  }
});

const [Form, formApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  showDefaultActions: false,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入',
      },
      // 字段名
      fieldName: 'code',
      // 界面显示的label
      label: '编码',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'displayText',
      label: '名称',
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'description',
      label: '描述',
      rules: z.string().default('').optional(),
    },
  ],
  wrapperClass: 'grid-cols-1',
});


</script>
<template>
  <Modal :title="data.isEdit ? '编辑' : '新增'"> 
    <Form></Form>
  </Modal>
</template>
