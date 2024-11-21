<script setup lang="ts">
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button, message as Message, Modal, Space, Tag } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  postNotificationNotificationPage,
  postNotificationRead,
} from '#/api-client';

defineOptions({
  name: 'AbpNotifyItem',
});

const formOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      fieldName: 'messageType',
      label: 'messageType',
      defaultValue: 20,
      dependencies: {
        show: () => false,
        triggerFields: ['messageType'],
      },
    },
    {
      component: 'Input',
      fieldName: 'title',
      label: '标题',
    },
    {
      component: 'Input',
      fieldName: 'content',
      label: '内容',
    },
    {
      component: 'Select',
      fieldName: 'messageLevel',
      label: '级别',
      componentProps: {
        options: [
          {
            label: '警告',
            value: 10,
          },
          {
            label: '正常',
            value: 20,
          },
          {
            label: '错误',
            value: 30,
          },
        ],
      },
    },

    {
      component: 'Select',
      fieldName: 'read',
      label: '是否已读',
      componentProps: {
        options: [
          {
            label: '是',
            value: true,
          },
          {
            label: '否',
            value: false,
          },
        ],
      },
    },
  ],
  wrapperClass: 'grid-cols-5',
};
const userStore = useUserStore();
const gridOptions: VxeGridProps<any> = {
  checkboxConfig: {},
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'title', title: '标题', minWidth: '150' },
    { field: 'content', title: '内容', minWidth: '150' },
    // { field: 'messageTypeName', title: '类型', minWidth: '150' },
    {
      field: 'messageLevelName',
      title: '级别',
      minWidth: '150',
      slots: { default: 'messageLevel' },
    },
    { field: 'senderUserName', title: '发送人', minWidth: '150' },
    { field: 'receiveUserName', title: '接收人', minWidth: '150' },
    {
      field: 'read',
      title: '是否已读',
      minWidth: '150',
      slots: { default: 'read' },
    },
    {
      field: 'creationTime',
      title: '创建时间',
      minWidth: '150',
      formatter: ({ cellValue }) => {
        return dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: '操作',
      field: 'action',
      fixed: 'right',
      minWidth: '150',
      slots: { default: 'action' },
    },
  ],
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
            receiverUserId: userStore.userInfo?.userId,
            ...formValues,
          },
        });
        return data;
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

const onRead = (row: any) => {
  if (row.read) {
    Message.info('该消息已读,不需要重复设置');
    return;
  }
  Modal.confirm({
    title: `确认设置已读吗？`,
    onOk: async () => {
      await postNotificationRead({ body: { id: row.id } });
      gridApi.reload();
      Message.success('设置成功');
    },
  });
};
</script>

<template>
  <Page auto-content-height title="消息列表">
    <Grid>
      <template #messageLevel="{ row }">
        <Tag v-if="row.messageLevel === 10" color="yellow">
          {{ row.messageLevelName }}
        </Tag>
        <Tag v-if="row.messageLevel === 20" color="green">
          {{ row.messageLevelName }}
        </Tag>
        <Tag v-if="row.messageLevel === 30" color="red">
          {{ row.messageLevelName }}
        </Tag>
      </template>
      <template #read="{ row }">
        <Tag v-if="row.read" color="green"> 已读 </Tag>
        <Tag v-else color="red"> 未读 </Tag>
      </template>

      <template #action="{ row }">
        <Space>
          <Button size="small" type="primary" @click="onRead(row)">
            设置已读
          </Button>
        </Space>
      </template>
    </Grid>
  </Page>
</template>

<style scoped></style>
