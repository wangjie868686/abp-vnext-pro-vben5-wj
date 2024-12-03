<script setup lang="ts">
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { NButton as Button, NSpace as Space, NTag as Tag } from 'naive-ui';

import { useVbenForm } from '#/adapter/form';
import { message as Message } from '#/adapter/naive';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  postNotificationNotificationPage,
  postNotificationSendBroadCastErrorMessage,
  postNotificationSendBroadCastInformationMessage,
  postNotificationSendBroadCastWarningMessage,
} from '#/api-client';
import { $t } from '#/locales';

import { addFormSchema, querySchema, tableSchema } from './schema';

defineOptions({
  name: 'AbpNotification',
});

const formOptions: VbenFormProps = {
  schema: querySchema,
  wrapperClass: 'grid-cols-4',
};

const gridOptions: VxeGridProps<any> = {
  checkboxConfig: {},
  columns: tableSchema,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  toolbarConfig: {
    custom: true,
  },
  customConfig: {
    storage: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        const { data } = await postNotificationNotificationPage({
          body: {
            pageIndex: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          },
        });
        return data;
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

const editRow: Record<string, any> = ref({});
const [AddModal, addModalApi] = useVbenModal({
  draggable: true,
  onConfirm: submit,
  onBeforeClose: () => {
    editRow.value = {};
  },
});

const [AddForm, addFormApi] = useVbenForm({
  // 默认展开
  collapsed: false,
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    labelWidth: 110,
    componentProps: {
      class: 'w-4/5',
    },
  },
  layout: 'horizontal',
  schema: addFormSchema,
  showCollapseButton: false,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

// 新增和编辑提交的逻辑
async function submit() {
  const { valid } = await addFormApi.validate();
  if (!valid) return;

  const formValues = await addFormApi.getValues();

  try {
    addModalApi.setState({ loading: true, confirmLoading: true });
    const messageLevel = formValues.messageLevel;
    if (messageLevel === 10) {
      await postNotificationSendBroadCastWarningMessage({
        body: formValues,
      });
    }
    if (messageLevel === 20) {
      await postNotificationSendBroadCastInformationMessage({
        body: formValues,
      });
    }
    if (messageLevel === 30) {
      await postNotificationSendBroadCastErrorMessage({
        body: formValues,
      });
    }
    Message.success($t('common.success'));
    addModalApi.close();
    gridApi.reload();
  } finally {
    addModalApi.setState({ loading: false, confirmLoading: false });
  }
}

const openAddModal = async () => {
  editRow.value = {};
  addModalApi.open();
};
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <Space>
          <Button type="primary" @click="openAddModal">
            {{ $t('abp.message.sendNotification') }}
          </Button>
        </Space>
      </template>

      <template #messageLevel="{ row }">
        <Tag v-if="row.messageLevel === 10" type="primary">
          {{ row.messageLevelName }}
        </Tag>
        <Tag v-if="row.messageLevel === 20" type="success">
          {{ row.messageLevelName }}
        </Tag>
        <Tag v-if="row.messageLevel === 30" type="error">
          {{ row.messageLevelName }}
        </Tag>
      </template>
    </Grid>

    <AddModal :title="$t('abp.message.sendNotification')" class="w-[600px]">
      <AddForm />
    </AddModal>
  </Page>
</template>

<style scoped></style>
