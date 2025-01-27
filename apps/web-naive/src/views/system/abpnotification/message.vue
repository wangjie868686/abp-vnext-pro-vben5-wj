<script setup lang="ts">
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { NButton as Button, NSpace as Space, NTag as Tag } from 'naive-ui';

import { useVbenForm } from '#/adapter/form';
import { dialog, message as Message } from '#/adapter/naive';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  postNotificationNotificationPage,
  postNotificationRead,
  postNotificationSendBroadCastErrorMessage,
  postNotificationSendBroadCastInformationMessage,
  postNotificationSendBroadCastWarningMessage,
  postNotificationSendCommonErrorMessage,
  postNotificationSendCommonInformationMessage,
  postNotificationSendCommonWarningMessage,
  postUsersFindByUserName,
} from '#/api-client';
import { $t } from '#/locales';

import {
  addFormSchema,
  addMessageFormSchema,
  queryMessageSchema,
  tableMessageSchema,
} from './schema';

defineOptions({
  name: 'AbpMessage',
});

const formOptions: VbenFormProps = {
  schema: queryMessageSchema,
  wrapperClass: 'grid-cols-5',
};

const gridOptions: VxeGridProps<any> = {
  checkboxConfig: {},
  columns: tableMessageSchema,
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
const [AddBroadCastModal, addBroadCastModalApi] = useVbenModal({
  draggable: true,
  onConfirm: broadCastSubmit,
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
  schema: addMessageFormSchema,
  showCollapseButton: false,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});
const [AddBroadCastForm, addBroadCastFormApi] = useVbenForm({
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
async function broadCastSubmit() {
  const { valid } = await addBroadCastFormApi.validate();
  if (!valid) return;
  const formValues = await addBroadCastFormApi.getValues();

  try {
    addBroadCastModalApi.setState({ loading: true, confirmLoading: true });
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
    addBroadCastModalApi.close();
    gridApi.reload();
  } finally {
    addBroadCastModalApi.setState({ loading: false, confirmLoading: false });
  }
}
// 新增和编辑提交的逻辑
async function submit() {
  const { valid } = await addFormApi.validate();
  if (!valid) return;
  let formValues = await addFormApi.getValues();
  const user = await postUsersFindByUserName({
    body: { userName: formValues.userName },
  });
  formValues = {
    ...formValues,
    receiveUserId: user.data?.id,
    receiveUserName: user.data?.userName,
  };

  try {
    addModalApi.setState({ loading: true, confirmLoading: true });
    const messageLevel = formValues.messageLevel;
    if (messageLevel === 10) {
      await postNotificationSendCommonWarningMessage({
        body: formValues,
      });
    }
    if (messageLevel === 20) {
      await postNotificationSendCommonInformationMessage({
        body: formValues,
      });
    }
    if (messageLevel === 30) {
      await postNotificationSendCommonErrorMessage({
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
const openBroadCastAddModal = async () => {
  editRow.value = {};
  addBroadCastModalApi.open();
};
const onRead = (row: any) => {
  if (row.read) {
    // Message.info('该消息已读,不需要重复设置');
    return;
  }

  dialog.warning({
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    closable: false,
    title: $t('abp.message.confirmRead'),
    onPositiveClick: async () => {
      await postNotificationRead({ body: { id: row.id } });
      gridApi.reload();
      Message.success($t('common.success'));
    },
  });
};
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <Space>
          <Button type="primary" @click="openAddModal">
            {{ $t('abp.message.sendMessage') }}
          </Button>
          <!-- <Button type="primary" @click="openBroadCastAddModal">
            发送通告
          </Button> -->
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
      <template #read="{ row }">
        <Tag v-if="row.read" type="success"> {{ $t('abp.message.read') }} </Tag>
        <Tag v-else type="primary"> {{ $t('abp.message.unread') }} </Tag>
      </template>

      <template #action="{ row }">
        <Space>
          <Button size="small" type="primary" @click="onRead(row)">
            {{ $t('abp.message.setRead') }}
          </Button>
        </Space>
      </template>
    </Grid>

    <AddModal :title="$t('abp.message.sendMessage')" class="w-[600px]">
      <AddForm />
    </AddModal>

    <AddBroadCastModal
      :title="$t('abp.message.sendNotification')"
      class="w-[600px]"
    >
      <AddBroadCastForm />
    </AddBroadCastModal>
  </Page>
</template>

<style scoped></style>
