<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { ref } from 'vue';
import { useVbenForm, z } from '#/adapter/form';
import { message } from 'ant-design-vue';
const data = ref<any>({});

const emit = defineEmits(['reload']);

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    try {
      modalApi.setState({ loading: true, confirmLoading: true });
      // 获取表单值
      const values = await formApi.getValues();
      console.info('values', values);
      if (data.value.isEdit) {
        // 编辑
        message.success('编辑成功');
      } else {
        // 新增
        message.success('新增成功');
      }
      modalApi.close();
    } finally {
      modalApi.setState({ loading: false, confirmLoading: false });
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
    }
  },
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
      fieldName: 'field1',
      // 界面显示的label
      label: '字段1',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      defaultValue: '默认值',
      fieldName: 'field2',
      label: '默认值(必填)',
      rules: 'required',
    },
    {
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入',
      },
      // 字段名
      fieldName: 'field4',
      // 界面显示的label
      label: '邮箱',
      rules: z.string().email('请输入正确的邮箱'),
    },
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'password',
      label: '密码',
      rules: 'required',
    },
  ],
  wrapperClass: 'grid-cols-1',
});
</script>
<template>
  <Modal :title="data.isEdit ? '编辑' : '新增'">
    <Form />
  </Modal>
</template>
