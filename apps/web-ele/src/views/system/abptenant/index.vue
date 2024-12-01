<script setup lang="ts">
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import {
  ElButton as Button,
  ElMessage as Message,
  ElMessageBox as Modal,
  ElSpace as Space,
} from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  postTenantsCreate,
  postTenantsDelete,
  postTenantsPage,
  postTenantsUpdate,
} from '#/api-client';
import { $t } from '#/locales';

import ConnectionString from './ConnectionStringModal.vue';
import FeatureManage from './FeatureManageModal.vue';
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
      Message.success(
        editRow.value.id ? $t('common.editSuccess') : $t('common.addSuccess'),
      );
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
  const message = $t('common.confirmDelete') + row.name;
  Modal.confirm(message).then(async () => {
    await postTenantsDelete({ body: { id: row.id } });
    gridApi.reload();
    Message.success($t('common.deleteSuccess'));
  });
}
const openAddModal = async () => {
  editRow.value = {};
  tenantModalApi.open();
};

const [FeatureManageModal, featureManageModalApi] = useVbenModal({
  connectedComponent: FeatureManage,
});
const openFeatureManage = async (row: any) => {
  featureManageModalApi.setData({
    id: row.id,
  });
  featureManageModalApi.open();
};
const [ConnectionStringModal, connectionStringModalApi] = useVbenModal({
  connectedComponent: ConnectionString,
  showCancelButton: false,
  showConfirmButton: false,
});
const openConnectionStringModal = (row: any) => {
  connectionStringModalApi.setData({
    id: row.id,
  });
  connectionStringModalApi.open();
};
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <Space>
          <Button
            type="primary"
            v-access:code="'AbpTenantManagement.Tenants.Create'"
            @click="openAddModal"
          >
            {{ $t('common.add') }}
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
            {{ $t('common.edit') }}
          </Button>
          <Button
            size="small"
            type="primary"
            @click="openConnectionStringModal(row)"
          >
            {{ $t('abp.tenant.connectionString') }}
          </Button>
          <Button
            size="small"
            type="primary"
            v-access:code="'AbpTenantManagement.Tenants.Update'"
            @click="openFeatureManage(row)"
          >
            {{ $t('abp.tenant.featureManagement') }}
          </Button>
          <Button
            danger
            size="small"
            type="danger"
            v-access:code="'AbpTenantManagement.Tenants.Delete'"
            @click="onDel(row)"
          >
            {{ $t('common.delete') }}
          </Button>
        </Space>
      </template>
    </Grid>

    <TenantModal
      :title="editRow.id ? $t('common.edit') : $t('common.add')"
      class="w-[600px]"
    >
      <component :is="editRow.id ? EditForm : AddForm" />
    </TenantModal>
    <FeatureManageModal />
    <ConnectionStringModal />
  </Page>
</template>

<style scoped></style>
