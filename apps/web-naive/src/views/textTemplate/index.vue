<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';

import { NButton as Button, NSpace as Space } from 'naive-ui';

import { dialog as Dialog } from '#/adapter/naive';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  postTextTemplatesDelete,
  postTextTemplatesPage,
} from '#/api-client/index';
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
  wrapperClass: 'grid-cols-4',
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
        const { data } = await postTextTemplatesPage({
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
  Dialog.warning({
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    closable: false,
    title: `${$t('common.confirmDelete')}?`,
    onPositiveClick: async () => {
      await postTextTemplatesDelete({
        body: {
          id: row.id,
        },
      });
      gridApi.reload();
    },
  });
};
const exportData = async () => {
  gridApi.setLoading(true);
  try {
    const formValues = await gridApi.formApi.getValues();
    const {
      pager: { currentPage, pageSize },
    } = await gridApi.grid.getProxyInfo();
    const pagination = { pageIndex: currentPage, pageSize };
    const { data } = await fileRequest.post(
      '/TextTemplates/Export',
      { ...formValues, ...pagination },
      { responseType: 'blob' },
    );
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '模板导出.xlsx');
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } finally {
    gridApi.setLoading(false);
  }
};
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <Space>
          <Space>
            <Button
              type="primary"
              v-access:code="'AbpProTemplate.TemplateManagement.Create'"
              @click="handleAdd"
            >
              {{ $t('common.add') }}
            </Button>
            <Button
              type="primary"
              v-access:code="'AbpProTemplate.TemplateManagement.Export'"
              @click="exportData"
            >
              {{ $t('common.export') }}
            </Button>
          </Space>
        </Space>
      </template>
      <template #action="{ row }">
        <Button
          size="small"
          style="margin-right: 10px"
          type="primary"
          v-access:code="'AbpProTemplate.TemplateManagement.Update'"
          @click="handleEdit(row)"
        >
          {{ $t('common.edit') }}
        </Button>

        <Button
          size="small"
          type="error"
          v-access:code="'AbpProTemplate.TemplateManagement.Delete'"
          @click="handleDelete(row)"
        >
          {{ $t('common.delete') }}
        </Button>
      </template>
    </Grid>
    <AddVbenModal @reload="gridApi.reload" />
    <EditVbenModal @reload="gridApi.reload" />
  </Page>
</template>
<style scoped></style>
