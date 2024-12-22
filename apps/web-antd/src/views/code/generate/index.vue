<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { Card, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { postProjectsAll, postTemplatesAll } from '#/api-client/index';
import fileRequest from '#/api-client-config/index-blob';
import { $t } from '#/locales';

const router = useRouter();
const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 提交函数
  handleSubmit: onSubmit,
  submitButtonOptions: {
    content: $t('code.download'),
  },
  handleReset: onPreview,
  resetButtonOptions: {
    content: $t('code.preview'),
  },
  wrapperClass: 'grid-cols-1',
  layout: 'horizontal',
  schema: [
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        options: [],
        showSearch: true,
      },
      fieldName: 'projectId',
      label: $t('code.project'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        options: [],
        showSearch: true,
      },
      fieldName: 'templateId',
      label: $t('code.template'),
      rules: 'required',
    },
  ],
});
onMounted(async () => {
  const res = await postProjectsAll();
  baseFormApi.updateSchema([
    {
      componentProps: {
        options: res?.data?.map((item) => ({
          label: item.projectName,
          value: item.id,
        })),
      },
      fieldName: 'projectId',
    },
  ]);
  const res2 = await postTemplatesAll();
  baseFormApi.updateSchema([
    {
      componentProps: {
        options: res2?.data?.map((item) => ({
          label: item.name,
          value: item.id,
        })),
      },
      fieldName: 'templateId',
    },
  ]);
});
async function onSubmit() {
  try {
    baseFormApi.setState({ submitButtonOptions: { loading: true } });
    const formValues = await baseFormApi.getValues();

    const { data } = await fileRequest.post(
      '/Generator/Down',
      { ...formValues },
      { responseType: 'blob' },
    );
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '源码.zip');
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    message.success({
      content: '下载成功，请在浏览器右上角下载查看源码.zip',
    });
  } finally {
    baseFormApi.setState({ submitButtonOptions: { loading: false } });
  }
}

async function onPreview() {
  baseFormApi.setState({ resetButtonOptions: { loading: true } });
  const formValues = await baseFormApi.getValues();
  router.push({
    name: 'preview',
    query: {
      templateId: formValues.templateId,
      projectId: formValues.projectId,
    },
  });
}
</script>

<template>
  <Page
    :description="$t('code.description')"
    :title="$t('code.autoGenerate')"
    content-class="flex flex-col gap-4"
  >
    <Card title="">
      <BaseForm />
    </Card>
  </Page>
</template>
