<script lang="ts" setup>
import { useVbenModal, type VbenFormProps } from '@vben/common-ui';
import { ref } from 'vue';
import { Button, Modal, message, } from 'ant-design-vue';
import { postTenantsPageConnectionString, postTenantsDeleteConnectionString, postTenantsAddOrUpdateConnectionString } from '#/api-client';
import { $t } from '#/locales';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import AddEditModal from './AddEditModal.vue';

const data = ref();
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
  schema: [{
    component: 'Input',
    componentProps: {
    },
    fieldName: 'name',
    label: '名称',
  }, {
    component: 'Input',
    componentProps: {
    },
    fieldName: 'value',
    label: '连接字符串',
  },],
};
const gridOptions: VxeGridProps<any> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'name', title: '名称' },
    { field: 'value', title: '连接字符串' },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
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
}

const [AddEditModalComponent, addEditModalApi] = useVbenModal({
  connectedComponent: AddEditModal,
});

</script>
<template>
  <div>
    <ConnectionString title="连接字符串" fullscreen>
      <Grid>
        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="addEditModalApi.open">
            新增或编辑
          </Button>
        </template>
        <template #action="{ row }">
          <Button danger type="link" @click="onDel(row)">删除</Button>
        </template>
      </Grid>
    </ConnectionString>
    <AddEditModalComponent :id="data.id" @reload="gridApi.reload" />
  </div>
</template>
