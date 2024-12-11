<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';

import { Page, useVbenModal, type VbenFormProps } from '@vben/common-ui';
import type { DropdownOption, TreeOption } from 'naive-ui'
import {
  NButton as Button,
  NInput as Input,
  NTabPane as TabPane,
  NTabs as Tabs,
  NTree as Tree,
  NDropdown as Dropdown,
} from 'naive-ui';

import { useVbenForm } from '#/adapter/form';
import { dialog, message } from '#/adapter/naive';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  postOrganizationUnitsAddRoleToOrganizationUnitAsync,
  postOrganizationUnitsAddUserToOrganizationUnit,
  postOrganizationUnitsCreate,
  postOrganizationUnitsDelete,
  postOrganizationUnitsGetRoles,
  postOrganizationUnitsGetUnAddRoles,
  postOrganizationUnitsGetUnAddUsers,
  postOrganizationUnitsGetUsers,
  postOrganizationUnitsRemoveRoleFromOrganizationUnitAsync,
  postOrganizationUnitsRemoveUserFromOrganizationUnit,
  postOrganizationUnitsTree,
  type TreeOutput,
} from '#/api-client/index';
import { $t } from '#/locales';

import ContextMenu from './ContextMenu.vue';
import OrgTreeAddModalComponent from './OrgTreeAddModal.vue';
import OrgTreeEditModalComponent from './OrgTreeEditModal.vue';
// const { isDark } = usePreferences();

const isExpandAll = ref<boolean>(false);
const searchValue = ref<string>('');
const gData = ref<Array<TreeOption>>([]);
const activeKey = ref('1');
const currentSelectedKey = ref('');
const parentDisplayName = ref('');
const selectRoles = ref();
const selectUsers = ref();

const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
});

const contextMenuOptions = [
  { label: $t('common.add'), key: 'add' },
  { label: $t('common.edit'), key: 'edit' },
  { label: $t('common.delete'), key: 'delete' },
];

function onRightClick({ event, node }) {
  event.preventDefault();
  event.stopPropagation();
  if (!currentSelectedKey.value) {
    message.warning($t('abp.organizationunit.selectNode'));
    return;
  }
  contextMenu.visible = true;
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
}

const onContextMenuSelect = async (key: string) => {
  switch (key) {
    case 'add': {
      orgTreeAddModalApi.setData({
        parentDisplayName: parentDisplayName.value,
        parentId: currentSelectedKey.value,
      });
      orgTreeAddModalApi.open();
      break;
    }
    case 'delete': {
      Modal.confirm({
        title: `${$t('common.confirmDelete')}?`,
        onOk: async () => {
          await postOrganizationUnitsDelete({
            body: {
              id: currentSelectedKey.value,
            },
          });
          message.success($t('common.success'));
          currentSelectedKey.value = '';
          getTreeData();
        },
      });
      break;
    }
    case 'edit': {
      orgTreeEditModalApi.setData({
        displayName: parentDisplayName.value,
        id: currentSelectedKey.value,
      });
      orgTreeEditModalApi.open();
      break;
    }
  }
  closeContextMenu();
};

const handleClickOutside = () => {
  if (contextMenu.visible) {
    closeContextMenu();
  }
};

const closeContextMenu = () => {
  contextMenu.visible = false;
};

const dataList = ref<any[]>([]);

const generateList = (data) => {
  if (!data) return;
  for (const node of data) {
    const { key, title, children } = node;
    dataList.value.push({ key, title });
    if (children) {
      generateList(children);
    }
  }
};

const getParentKey = (
  key: number | string,
  tree: any,
): number | string | undefined => {
  if (!tree) return undefined;
  let parentKey;
  for (const node of tree) {
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};

// 获取所有节点的key
const getAllKeys = (tree): (number | string)[] => {
  const keys: (number | string)[] = [];
  const traverse = (nodes) => {
    if (!nodes) return;
    nodes.forEach((node) => {
      if (node.key) {
        keys.push(node.key);
      }
      if (node.children) {
        traverse(node.children);
      }
    });
  };
  traverse(tree);
  return keys;
};

const dropdownOptions =  [
  {
    label: '展开全部',
    key: 'open',
  },
  {
    label: '折叠全部',
    key: 'close'
  },
];
const handleTreeDropdownSelect = (key: string | number) => {
  isExpandAll.value = key === 'open';
}

async function getTreeData() {
  const { data = [] } = await postOrganizationUnitsTree();
  gData.value = data;
  dataList.value = [];
  generateList(data);
}

onMounted(() => {
  getTreeData();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const [OrgTreeAddModal, orgTreeAddModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: OrgTreeAddModalComponent,
});

const [OrgTreeEditModal, orgTreeEditModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: OrgTreeEditModalComponent,
});

const [OrgAddModal, orgModalApi] = useVbenModal({
  onConfirm: async () => {
    const { valid } = await orgFormApi.validate();
    if (!valid) return;
    try {
      orgModalApi.setState({ loading: true, confirmLoading: true });
      const values = await orgFormApi.getValues();
      await postOrganizationUnitsCreate({
        body: { ...values },
      });
      getTreeData();
      message.success($t('common.success'));
      orgModalApi.close();
    } finally {
      orgModalApi.setState({ loading: false, confirmLoading: false });
    }
  },
});

const [OrgAddForm, orgFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-4/5',
    },
  },
  showDefaultActions: false,
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'displayName',
      label: $t('abp.organizationunit.name'),
      rules: 'required',
    },
  ],
  wrapperClass: 'grid-cols-1',
});

const userFormOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      fieldName: 'filter',
      label: $t('abp.organizationunit.userName'),
      labelWidth: 50,
      componentProps: {
        allowClear: true,
      },
    },
  ],
  wrapperClass: 'grid-cols-2',
  showDefaultActions: true,
  submitOnEnter: true,
  showCollapseButton: false,
};

const userGridOptions: VxeGridProps<any> = {
  columns: [
    // { type: 'radio', width: '50', },
    { type: 'seq', title: $t('common.seq'), width: '50' },
    {
      field: 'userName',
      title: $t('abp.organizationunit.userName'),
      minWidth: '200',
    },
    {
      field: 'email',
      title: $t('abp.organizationunit.email'),
      minWidth: '200',
    },
    {
      title: $t('common.action'),
      field: 'action',
      fixed: 'right',
      width: '150',
      slots: { default: 'action' },
    },
  ],
  minHeight: '800',
  keepSource: true,
  pagerConfig: {},
  radioConfig: {
    highlight: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        if (!currentSelectedKey.value) return;
        const { data } = await postOrganizationUnitsGetUsers({
          body: {
            pageIndex: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
            organizationUnitId: currentSelectedKey.value,
          },
        });
        return data;
      },
    },
  },
};

const [UserGrid, userGridApi] = useVbenVxeGrid({
  gridOptions: userGridOptions,
  formOptions: userFormOptions,
});

const rolesGridOptions: VxeGridProps<any> = {
  columns: [
    { title: $t('common.seq'), type: 'seq', width: 50 },
    { field: 'name', title: $t('abp.organizationunit.role'), minWidth: '200' },
    {
      title: $t('common.action'),
      field: 'action',
      fixed: 'right',
      width: '150',
      slots: { default: 'action' },
    },
  ],
  minHeight: '800',
  keepSource: true,
  pagerConfig: {},
  radioConfig: {
    highlight: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        if (!currentSelectedKey.value) return;
        const { data } = await postOrganizationUnitsGetRoles({
          body: {
            pageIndex: page.currentPage,
            pageSize: page.pageSize,
            organizationUnitId: currentSelectedKey.value,
            ...formValues,
          },
        });
        return data;
      },
    },
  },
};

const [RolesGrid, rolesGridApi] = useVbenVxeGrid({
  gridOptions: rolesGridOptions,
});

const onSelect = (keys: string[], event: any) => {
  currentSelectedKey.value = keys[0] ?? '';
  parentDisplayName.value = event.node.title;
  if (!keys[0]) return;
  activeKey.value === '1' ? userGridApi.reload() : rolesGridApi.reload();
};

const [AddRolesModal, addRolesModalApi] = useVbenModal({
  onConfirm: async () => {
    try {
      addRolesModalApi.setState({ loading: true, confirmLoading: true });
      await postOrganizationUnitsAddRoleToOrganizationUnitAsync({
        body: {
          roleId: selectRoles.value.map((item: { id: string }) => item.id),
          organizationUnitId: currentSelectedKey.value,
        },
      });
      addRolesModalApi.close();
      rolesGridApi.reload();
      message.success($t('common.add'));
    } finally {
      addRolesModalApi.setState({ loading: false, confirmLoading: false });
    }
  },
});

const unAddRolesOptions: VxeGridProps<any> = {
  columns: [
    { title: '', type: 'checkbox', width: 50 },
    { field: 'name', title: $t('abp.organizationunit.role'), minWidth: '200' },
  ],
  minHeight: '800',
  keepSource: true,
  pagerConfig: {},
  radioConfig: {
    highlight: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        if (!currentSelectedKey.value) return;
        const { data } = await postOrganizationUnitsGetUnAddRoles({
          body: {
            pageIndex: page.currentPage,
            pageSize: page.pageSize,
            organizationUnitId: currentSelectedKey.value,
          },
        });
        return data;
      },
    },
  },
};

const unAddRolesTableEvents = {
  checkboxChange: ({ records }: { records: { name: string }[] }) => {
    selectRoles.value = records;
  },
};

const [UnAddRolesTable, unAddRolesTableApi] = useVbenVxeGrid({
  gridOptions: unAddRolesOptions,
  gridEvents: unAddRolesTableEvents,
});

const unAddUsersFormOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      fieldName: 'filter',
      label: $t('abp.organizationunit.userName'),
      labelWidth: 50,
      componentProps: {
        allowClear: true,
      },
    },
  ],
  wrapperClass: 'grid-cols-2',
  showDefaultActions: true,
  submitOnEnter: true,
  showCollapseButton: false,
};

const unUsersOptions: VxeGridProps<any> = {
  columns: [
    { type: 'checkbox', title: '', width: 50 },
    {
      field: 'userName',
      title: $t('abp.organizationunit.userName'),
      minWidth: '150',
    },
    {
      field: 'email',
      title: $t('abp.organizationunit.email'),
      minWidth: '200',
    },
  ],
  minHeight: '800',
  keepSource: true,
  pagerConfig: {},
  radioConfig: {
    highlight: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        if (!currentSelectedKey.value) return;
        const { data } = await postOrganizationUnitsGetUnAddUsers({
          body: {
            pageIndex: page.currentPage,
            pageSize: page.pageSize,
            organizationUnitId: currentSelectedKey.value,
            ...formValues,
          },
        });
        return data;
      },
    },
  },
};

const unAddUserTableEvents = {
  checkboxChange: ({ records }: { records: { name: string }[] }) => {
    selectUsers.value = records;
  },
};
const [UnAddUsersTable, unAddUsersTableApi] = useVbenVxeGrid({
  gridOptions: unUsersOptions,
  formOptions: unAddUsersFormOptions,
  gridEvents: unAddUserTableEvents,
});
const [AddUsersModal, addUsersModalApi] = useVbenModal({
  onConfirm: async () => {
    try {
      addUsersModalApi.setState({ loading: true, confirmLoading: true });
      await postOrganizationUnitsAddUserToOrganizationUnit({
        body: {
          userId: selectUsers.value.map((item: { id: string }) => item.id),
          organizationUnitId: currentSelectedKey.value,
        },
      });
      addUsersModalApi.close();
      userGridApi.reload();
      message.success($t('common.add'));
    } finally {
      addUsersModalApi.setState({ loading: false, confirmLoading: false });
    }
  },
});

function removeRole(row: Record<string, any>) {
  dialog.warning({
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    closable: false,
    title: `${$t('common.confirmDelete')}${row.name} ?`,
    onPositiveClick: async () => {
      try {
        await postOrganizationUnitsRemoveRoleFromOrganizationUnitAsync({
          body: {
            roleId: row.id,
            organizationUnitId: currentSelectedKey.value,
          },
        });
        rolesGridApi.reload();
        message.success($t('common.success'));
      } catch (error) {
        console.error(error);
      }
    },
  });
}

function removeUser(row: Record<string, any>) {
  dialog.warning({
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    closable: false,
    title: `${$t('common.confirmDelete')}${row.userName} ?`,
    onPositiveClick: async () => {
      try {
        await postOrganizationUnitsRemoveUserFromOrganizationUnit({
          body: {
            userId: row.id,
            organizationUnitId: currentSelectedKey.value,
          },
        });
        userGridApi.reload();
        message.success($t('common.success'));
      } catch (error) {
        console.error(error);
      }
    },
  });
}

const showDropdownRef = ref(false);
const optionsRef = ref<DropdownOption[]>([
  { label: $t('common.add'), key: 'add' },
  { label: $t('common.edit'), key: 'edit' },
  { label: $t('common.delete'), key: 'delete' },
]);
const xRef = ref(0)
const yRef = ref(0)
const handleSelect = () => {
  showDropdownRef.value = false
}

const handleClickoutside = () => {
        showDropdownRef.value = false
      }

const nodeProps = ({ option }: { option: TreeOption }) => {
  return {
    onClick() {
      console.log(option)
    },
    onContextmenu(e: MouseEvent): void {
      // optionsRef.value = [option]
      showDropdownRef.value = true
      xRef.value = e.clientX
      yRef.value = e.clientY
      console.log(e.clientX, e.clientY)
      e.preventDefault()
    }
  }

}

</script>

<template>
  <Page :auto-content-height="true">
    <div class="grid grid-cols-12 gap-4">
      <div class="bg-card col-span-4 xl:col-span-3">
        <div class="bg-card flex items-center justify-between p-3">
          <span class="text-lg">{{
            $t('abp.organizationunit.organizationunit')
          }}</span>
          <Button
            class="mx-3"
            size="small"
            type="primary"
            @click="orgModalApi.open"
          >
            {{ $t('abp.organizationunit.add') }}
          </Button>
          <Input v-model:value="searchValue" class="ml-1 flex-1" />
          <Dropdown class="ml-1" :options="dropdownOptions" @select="handleTreeDropdownSelect">
            <Button class="font-bold">......</Button>
          </Dropdown>
        </div>
        <Tree
          class="mt-3"
          label-field="title"
          :cancelable="false"
          :block-node="true"
          :data="gData"
          :default-expand-all="isExpandAll"
          :pattern="searchValue"
          :show-irrelevant-nodes="false"
          :node-props="nodeProps"
          @right-click="onRightClick"
          @select="onSelect"
        >
          <template #title="{ title }">
            <span v-if="title.indexOf(searchValue) > -1">
              {{ title.substring(0, title.indexOf(searchValue)) }}
              <span style="color: #f50">{{ searchValue }}</span>
              {{
                title.substring(title.indexOf(searchValue) + searchValue.length)
              }}
            </span>
            <span v-else>{{ title }}</span>

          </template>
        </Tree>
        <Dropdown
          placement="bottom-start"
          :show="showDropdownRef"
          :options="optionsRef"
          :x="xRef"
          :y="yRef"
          @select="handleSelect"
          @clickoutside="handleClickoutside"
        />
      </div>

      <div class="col-span-8 xl:col-span-9">
        <div class="bg-card">
          <Tabs v-model:active-key="activeKey" class="px-3">
            <TabPane key="1" :tab="$t('abp.organizationunit.member')" name="1">
              <UserGrid>
                <template #toolbar-actions>
                  <Button
                    :disabled="!currentSelectedKey"
                    type="primary"
                    @click="addUsersModalApi.open"
                  >
                    {{ $t('common.add') }}
                  </Button>
                </template>
                <template #action="{ row }">
                  <Button type="error" @click="removeUser(row)">
                    {{ $t('common.delete') }}
                  </Button>
                </template>
              </UserGrid>
            </TabPane>
            <TabPane key="2" :tab="$t('abp.organizationunit.role')" name="2">
              <RolesGrid>
                <template #toolbar-actions>
                  <Button
                    :disabled="!currentSelectedKey"
                    type="primary"
                    @click="addRolesModalApi.open"
                  >
                    {{ $t('common.add') }}
                  </Button>
                </template>

                <template #action="{ row }">
                  <Button type="error" @click="removeRole(row)">
                    {{ $t('common.delete') }}
                  </Button>
                </template>
              </RolesGrid>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>

    <OrgAddModal :title="$t('common.add')" class="w-[600px]">
      <OrgAddForm />
    </OrgAddModal>
    <AddRolesModal>
      <UnAddRolesTable />
    </AddRolesModal>

    <AddUsersModal>
      <UnAddUsersTable />
    </AddUsersModal>

    <OrgTreeAddModal @get-tree-data="getTreeData" />
    <OrgTreeEditModal @get-tree-data="getTreeData" />
    <ContextMenu
      v-if="contextMenu.visible"
      :options="contextMenuOptions"
      :x="contextMenu.x"
      :y="contextMenu.y"
      @close="closeContextMenu"
      @select="onContextMenuSelect"
    />
  </Page>
</template>

<style scoped></style>
