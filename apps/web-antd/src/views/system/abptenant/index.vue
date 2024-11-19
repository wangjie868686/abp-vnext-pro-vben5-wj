<script setup lang="ts">
import type { VbenFormProps, VxeGridProps } from '#/adapter';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message as Message, Modal, Space } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form.ts';
import { useVbenVxeGrid } from '#/adapter/vxe-table.ts';
import {
  postTenantsCreate,
  postTenantsDelete,
  postTenantsPage,
  postTenantsUpdate,
} from '#/api-client';

import {
  addTenantFormSchema,
  editTenantFormSchemaEdit,
  querySchema,
  tableSchema,
} from './schema';

defineOptions({
  name: 'AbpTenant',
});

const formOptions: VbenFormProps = {
  schema: querySchema,
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
        const { data } = await postTenantsPage({
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
const [TenantModal, tenantModalApi] = useVbenModal({
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
  schema: addTenantFormSchema,
  showCollapseButton: false,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const [EditForm, editFormApi] = useVbenForm({
  // 默认展开
  collapsed: false,
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    labelWidth: 110,
    componentProps: {
      class: 'w-4/5',
    },
  },
  // 提交函数
  layout: 'horizontal',
  schema: editTenantFormSchemaEdit,
  showCollapseButton: false,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

// 新增和编辑提交的逻辑
async function submit() {
  const isEdit = !!editRow.value.id;
  const formApi = isEdit ? editFormApi : addFormApi;
  const api = isEdit ? postTenantsUpdate : postTenantsCreate;
  const { valid } = await formApi.validate();
  if (!valid) return;

  const formValues = await formApi.getValues();

  try {
    tenantModalApi.setState({ loading: true, confirmLoading: true });
    const resp = await api({ body: formValues });
    if (resp.status === 200 || resp.status === 204) {
      Message.success(editRow.value.id ? '修改成功' : '新增成功');
      tenantModalApi.close();
      gridApi.reload();
    }
  } finally {
    tenantModalApi.setState({ loading: false, confirmLoading: false });
  }
}

async function onEdit(record: any) {
  editRow.value = record;
  tenantModalApi.open();
  editFormApi.setValues({ ...record });
}

function onDel(row: any) {
  Modal.confirm({
    title: `确认删除租户 ${row.name} 吗？`,
    onOk: async () => {
      await postTenantsDelete({ body: { id: row.id } });
      gridApi.reload();
      Message.success('删除成功');
    },
  });
}

const rolesList = ref([] as any);
const checkedRoles = ref([]);
const openAddModal = async () => {
  editRow.value = {};
  checkedRoles.value = [];
  tenantModalApi.open();
};
</script>

<template>
  <Page auto-content-height title="租户管理">
    <Grid>
      <template #toolbar-actions>
        <Space>
          <Button
            type="primary"
            v-access:code="'AbpTenantManagement.Tenants.Create'"
            @click="openAddModal"
          >
            新增
          </Button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <Button
            size="small"
            type="primary"
            v-access:code="'AbpTenantManagement.Tenants.Update'"
            @click="onEdit(row)"
          >
            编辑
          </Button>
          <Button
            danger
            size="small"
            type="primary"
            v-access:code="'AbpTenantManagement.Tenants.Delete'"
            @click="onDel(row)"
          >
            删除
          </Button>
        </Space>
      </template>
    </Grid>

    <TenantModal
      :title="editRow.id ? '编辑租户' : '新增租户'"
      class="w-[600px]"
    >
      <component :is="editRow.id ? EditForm : AddForm" />
    </TenantModal>
  </Page>
</template>

<style scoped></style>
