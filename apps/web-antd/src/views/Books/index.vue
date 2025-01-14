<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, Modal, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { postBooksDelete, postBooksPage } from '#/api-client/index';
import { $t } from '#/locales';

// 新增modal
import AddModal from './AddModal.vue';
// 编辑modal
import EditModal from './EditModal.vue';
import { querySchema, tableSchema } from './schema';

const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: querySchema,
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<any> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: tableSchema,
  keepSource: true,
  height: 'auto',
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
        if (formValues?.time?.length === 2) {
          formValues = {
            ...formValues,
            startCreationTime: formValues.time[0],
            endCreationTime: formValues.time[1],
          };
        }
        const { data } = await postBooksPage({
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

const [AddVbenModal, addModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: AddModal,
});
const [EditVbenModal, editModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: EditModal,
});
const handleAdd = () => {
  addModalApi.open();
};

const handleEdit = (row: Record<string, any>) => {
  editModalApi.setData({
    row,
  });
  editModalApi.open();
};

const handleDelete = (row: any) => {
  Modal.confirm({
    title: $t('common.confirmDelete')+'?',
    onOk: async () => {
      await postBooksDelete({
        body: {
          id: row.id,
        },
      });
      gridApi.reload();
    },
  });
};
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <Space>
          <Button type="primary" @click="handleAdd">
            新增
          </Button>
        </Space>
      </template>

      <template #action="{ row }">
        <Button type="link" @click="handleEdit(row)">
          编辑
        </Button>
        <Button danger type="link" @click="handleDelete(row)">
          删除
        </Button>
      </template>
    </Grid>
    <AddVbenModal @reload="gridApi.reload" />
    <EditVbenModal @reload="gridApi.reload" />
  </Page>
</template>
<style scoped></style>