<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal, type VbenFormProps } from '@vben/common-ui';

import { ElButton as Button, ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  postTenantsDeleteConnectionString,
  postTenantsPageConnectionString,
} from '#/api-client';
import { $t } from '#/locales';

import AddEditModal from './AddEditModal.vue';

const data = ref<Record<string, any>>({});
const [ConnectionString, modalApi] = useVbenModal({
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      modalApi.setState({ loading: true });
      data.value = modalApi.getData<Record<string, any>>();
      modalApi.setState({ loading: false });
    }
  },
});

const formOptions: VbenFormProps = {
  wrapperClass: 'grid-cols-12', // 表单外层样式，分成网格12列
  actionWrapperClass: 'col-span-3', // 表单操作按钮，占3列
  schema: [
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'name',
      label: $t('abp.tenant.connectionStringName'),
      formItemClass: 'col-span-3', // 表单项样式，占3列
      labelWidth: 180,
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'value',
      label: $t('abp.tenant.connectionString'),
      formItemClass: 'col-span-6', // 表单项样式，占6列
      labelWidth: 180,
    },
  ],
};
const gridOptions: VxeGridProps<any> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'name', title: $t('abp.tenant.connectionStringName') },
    { field: 'value', title: $t('abp.tenant.connectionString') },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('common.action'),
      width: 120,
    },
  ],
  toolbarConfig: {
    custom: true,
  },
  customConfig: {
    storage: true,
  },
  height: 'auto',
  keepSource: true,
  pagerConfig: {
    enabled: false, // 隐藏分页器
  },
  proxyConfig: {
    response: {
      total: 'totalCount',
    },
    ajax: {
      query: async ({ page }, formValues) => {
        const { data: tableData } = await postTenantsPageConnectionString({
          body: {
            pageIndex: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
            id: data.value?.id,
          },
        });
        return tableData;
      },
    },
  },
};
const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });
const onDel = (row: any) => {
  ElMessageBox.confirm(`${$t('common.confirmDelete')}${row.name} ?`, {
    type: 'warning',
  }).then(async () => {
    await postTenantsDeleteConnectionString({
      body: {
        tenantId: row.tenantId,
        name: row.name,
      },
    });
    gridApi.reload();
    ElMessage({
      type: 'success',
      message: $t('common.deleteSuccess'),
    });
  });
};

const [AddEditModalComponent, addEditModalApi] = useVbenModal({
  connectedComponent: AddEditModal,
});
</script>
<template>
  <div>
    <ConnectionString :title="$t('abp.tenant.connectionString')" fullscreen>
      <Grid>
        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="addEditModalApi.open">
            {{ $t('abp.tenant.addorEdit') }}
          </Button>
        </template>
        <template #action="{ row }">
          <Button link type="danger" @click="onDel(row)">
            {{ $t('common.delete') }}
          </Button>
        </template>
      </Grid>
    </ConnectionString>
    <AddEditModalComponent :id="data.id" @reload="gridApi.reload" />
  </div>
</template>
