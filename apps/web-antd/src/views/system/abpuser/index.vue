<script setup lang="ts">
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import {
  Button,
  CheckboxGroup,
  Dropdown,
  Menu,
  MenuItem,
  message as Message,
  Modal,
  Space,
  TabPane,
  Tabs,
  Tag,
} from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  postRolesAll,
  postUsersCreate,
  postUsersDelete,
  postUsersLock,
  postUsersPage,
  postUsersResetTwoFactor,
  postUsersRole,
  postUsersUpdate,
} from '#/api-client';
import fileRequest from '#/api-client-config/index-blob';
import { $t } from '#/locales';

import {
  addUserFormSchema,
  editUserFormSchemaEdit,
  querySchema,
  tableSchema,
} from './schema';

defineOptions({
  name: 'AbpUser',
});

const formOptions: VbenFormProps = {
  schema: querySchema,
};

const gridOptions: VxeGridProps<any> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
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
        const { data } = await postUsersPage({
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
const [UserModal, userModalApi] = useVbenModal({
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
  schema: addUserFormSchema,
  showCollapseButton: false,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
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
  schema: editUserFormSchemaEdit,
  showCollapseButton: false,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

// 新增和编辑提交的逻辑
async function submit() {
  const isEdit = !!editRow.value.id;
  const formApi = isEdit ? editFormApi : addFormApi;
  const api = isEdit ? postUsersUpdate : postUsersCreate;
  const { valid } = await formApi.validate();
  if (!valid) return;

  const formValues = await formApi.getValues();
  const fetchParams: any = isEdit
    ? {
        userInfo: { ...formValues, roleNames: checkedRoles.value },
        userId: editRow.value.id,
      }
    : { ...formValues, roleNames: checkedRoles.value };

  try {
    userModalApi.setState({ loading: true, confirmLoading: true });
    const resp = await api({ body: fetchParams });
    if (resp.status === 200 || resp.status === 204) {
      Message.success(
        editRow.value.id ? $t('common.editSuccess') : $t('common.addSuccess'),
      );
      userModalApi.close();
      gridApi.reload();
    }
  } finally {
    userModalApi.setState({ loading: false, confirmLoading: false });
  }
}

async function onEdit(record: any) {
  editRow.value = record;
  userModalApi.open();
  editFormApi.setValues({ ...record });
  getAllRoles();
  const { data: { items = [] } = {} } = await postUsersRole({
    body: { id: record.id },
  });
  checkedRoles.value = items?.map((item: any) => item.name) as any;
}

function onDel(row: any) {
  Modal.confirm({
    title: `${$t('common.confirmDelete')}${row.userName} ?`,
    onOk: async () => {
      await postUsersDelete({ body: { id: row.id } });
      gridApi.reload();
      Message.success($t('common.deleteSuccess'));
    },
  });
}

function resetTwoFactor(row: any) {
  Modal.confirm({
    title: `${$t('common.comfirm')}${$t('abp.user.resetTwoFactor')} ?`,
    onOk: async () => {
      await postUsersResetTwoFactor({ body: { userId: row.id } });
      gridApi.reload();
      Message.success($t('abp.user.resetTwoFactor') + $t('common.success'));
    },
  });
}

const onLock = async (row: Record<string, any>) => {
  await postUsersLock({ body: { userId: row.id, locked: !row.isActive } });
  gridApi.reload();
};

const rolesList = ref([] as any);
const checkedRoles = ref([]);
const openAddModal = async () => {
  editRow.value = {};
  checkedRoles.value = [];
  userModalApi.open();
  getAllRoles();
};

async function getAllRoles() {
  const { data: { items = [] } = {} } = await postRolesAll();
  rolesList.value = items?.map((item) => ({
    label: item.name,
    value: item.name,
  }));
}

const exportData = async () => {
  gridApi.setLoading(true);
  try {
    const formValues = await gridApi.formApi.getValues();
    const {
      pager: { currentPage, pageSize },
    } = await gridApi.grid.getProxyInfo();
    const pagination = { pageIndex: currentPage, pageSize };
    const { data } = await fileRequest.post(
      '/Users/export',
      { ...formValues, ...pagination },
      { responseType: 'blob' },
    );
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '用户列表导出.xlsx');
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
          <Button
            type="primary"
            v-access:code="'AbpIdentity.Users.Create'"
            @click="openAddModal"
          >
            {{ $t('common.add') }}
          </Button>
          <Button
            type="primary"
            v-access:code="'AbpIdentity.Users.Export'"
            @click="exportData"
          >
            {{ $t('common.export') }}
          </Button>
        </Space>
      </template>

      <template #isActive="{ row }">
        <component
          :is="
            h(
              Tag,
              { color: row.isActive ? 'green' : 'red' },
              row.isActive ? $t('common.enabled') : $t('common.disabled'),
            )
          "
        />
      </template>
      <template #twoFactorEnabled="{ row }">
        <component
          :is="
            h(
              Tag,
              { color: row.twoFactorEnabled ? 'green' : 'red' },
              row.twoFactorEnabled
                ? $t('common.enabled')
                : $t('common.disabled'),
            )
          "
        />
      </template>
      <template #action="{ row }">
        <Space>
          <Button
            size="small"
            type="primary"
            v-access:code="'AbpIdentity.Users.Update'"
            @click="onEdit(row)"
          >
            {{ $t('common.edit') }}
          </Button>
          <Dropdown>
            <Button size="small"> ...... </Button>
            <template #overlay>
              <Menu>
                <MenuItem @click="onLock(row)">
                  <Button
                    size="small"
                    type="link"
                    v-access:code="'AbpIdentity.Users.Enable'"
                  >
                    {{
                      row.isActive
                        ? $t('common.disabled')
                        : $t('common.enabled')
                    }}
                  </Button>
                </MenuItem>
                <MenuItem @click="onDel(row)">
                  <Button
                    danger
                    size="small"
                    type="link"
                    v-access:code="'AbpIdentity.Users.Delete'"
                  >
                    {{ $t('common.delete') }}
                  </Button>
                </MenuItem>

                <MenuItem @click="resetTwoFactor(row)">
                  <Button
                    size="small"
                    type="link"
                    v-access:code="'AbpIdentity.Users.ResetTwoFactor'"
                  >
                    {{ $t('abp.user.resetTwoFactor') }}
                  </Button>
                </MenuItem>
              </Menu>
            </template>
          </Dropdown>
        </Space>
      </template>
    </Grid>

    <UserModal
      :title="editRow.id ? $t('common.edit') : $t('common.add')"
      class="w-[800px]"
    >
      <Tabs>
        <TabPane key="1" :tab="$t('abp.user.user')">
          <component :is="editRow.id ? EditForm : AddForm" />
        </TabPane>
        <TabPane key="2" :tab="$t('abp.role.role')">
          <CheckboxGroup
            v-model:value="checkedRoles"
            :options="rolesList"
            name="checkboxgroup"
          />
        </TabPane>
      </Tabs>
    </UserModal>
  </Page>
</template>

<style scoped></style>
