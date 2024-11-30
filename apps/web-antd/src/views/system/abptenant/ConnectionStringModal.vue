<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal, type VbenFormProps } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

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
  schema: [
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'name',
      label: $t('abp.tenant.connectionStringName'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'value',
      label: $t('abp.tenant.connectionString'),
      rules: 'required',
    },
  ],
};
const gridOptions: VxeGridProps<any> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: $t('common.seq'), type: 'seq', width: 50 },
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
  pagerConfig: {},
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
  Modal.confirm({
    title: `${$t('common.confirmDelete')}${row.name} ?`,
    onOk: async () => {
      await postTenantsDeleteConnectionString({
        body: {
          tenantId: row.tenantId,
          name: row.name,
        },
      });
      gridApi.reload();
      message.success($t('common.deleteSuccess'));
    },
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
          <Button danger type="link" @click="onDel(row)">
            {{ $t('common.delete') }}
          </Button>
        </template>
      </Grid>
    </ConnectionString>
    <AddEditModalComponent :id="data.id" @reload="gridApi.reload" />
  </div>
</template>
