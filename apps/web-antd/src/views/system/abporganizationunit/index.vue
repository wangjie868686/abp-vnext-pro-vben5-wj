<script setup lang="ts">
import type { TreeProps } from 'ant-design-vue';
import type { DataNode } from 'ant-design-vue/es/tree';

import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';

import { Page, useVbenModal, type VbenFormProps } from '@vben/common-ui';

import {
  Button,
  Dropdown,
  Input,
  Menu,
  message as Message,
  Modal,
  Tabs,
  Tree,
} from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
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
const expandedKeys = ref<(number | string)[]>([]);
const searchValue = ref<string>('');
const autoExpandParent = ref<boolean>(true);
const gData = ref<Array<TreeOutput>>([]);

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
    Message.warning($t('abp.organizationunit.selectNode'));
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
          Message.success($t('common.success'));
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

async function getTreeData() {
  const { data = [] } = await postOrganizationUnitsTree();
  gData.value = data;
  generateList(data as any);
}

onMounted(() => {
  getTreeData();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const dataList: TreeProps['treeData'] = [];
const generateList = (data: TreeProps['treeData']) => {
  for (const node of data) {
    const key = node.key;
    dataList.push({ key, title: key });
    if (node.children) {
      generateList(node.children);
    }
  }
};

const getParentKey = (
  key: number | string,
  tree: TreeProps['treeData'],
): number | string | undefined => {
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
const getAllKeys = (tree: TreeProps['treeData']): (number | string)[] => {
  const keys: (number | string)[] = [];
  const traverse = (nodes: TreeProps['treeData']) => {
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

// 展开所有节点
const expandAll = () => {
  expandedKeys.value = getAllKeys(gData.value as TreeProps['treeData']);
  autoExpandParent.value = true;
};

// 折叠所有节点
const collapseAll = () => {
  expandedKeys.value = [];
  autoExpandParent.value = true;
};

watch(searchValue, (value) => {
  const expanded = dataList
    .map((item: DataNode) => {
      if (item.title.includes(value)) {
        return getParentKey(item.key, gData.value as TreeProps['treeData']);
      }
      return null;
    })
    .filter((item, i, self) => item && self.indexOf(item) === i);
  expandedKeys.value = expanded as (number | string)[];
  searchValue.value = value;
  autoExpandParent.value = true;
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
      Message.success($t('common.success'));
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
      Message.success($t('common.add'));
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
      query: async ({ page }) => {
        if (!currentSelectedKey.value) return;
        const { data } = await postOrganizationUnitsGetUnAddUsers({
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
      Message.success($t('common.add'));
    } finally {
      addUsersModalApi.setState({ loading: false, confirmLoading: false });
    }
  },
});

function removeRole(row: Record<string, any>) {
  Modal.confirm({
    title: `${$t('common.confirmDelete')}${row.name} ?`,
    onOk: async () => {
      try {
        await postOrganizationUnitsRemoveRoleFromOrganizationUnitAsync({
          body: {
            roleId: row.id,
            organizationUnitId: currentSelectedKey.value,
          },
        });
        rolesGridApi.reload();
        Message.success($t('common.success'));
      } catch (error) {
        console.error(error);
      }
    },
  });
}

function removeUser(row: Record<string, any>) {
  Modal.confirm({
    title: `${$t('common.confirmDelete')}${row.userName} ?`,
    onOk: async () => {
      try {
        await postOrganizationUnitsRemoveUserFromOrganizationUnit({
          body: {
            userId: row.id,
            organizationUnitId: currentSelectedKey.value,
          },
        });
        userGridApi.reload();
        Message.success($t('common.success'));
      } catch (error) {
        console.error(error);
      }
    },
  });
}

// 添加 onExpand 方法处理节点展开/折叠
const onExpand = (keys: (string | number)[], info: any) => {
  expandedKeys.value = keys;
  autoExpandParent.value = false;
};
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
          <Input.Search v-model:value="searchValue" class="ml-1 flex-1" />
          <Dropdown class="ml-1">
            <Button class="font-bold">......</Button>
            <template #overlay>
              <Menu>
                <Menu.Item @click="expandAll">
                  {{ $t('common.expandAll') }}
                </Menu.Item>
                <Menu.Item @click="collapseAll">
                  {{ $t('common.collapseAll') }}
                </Menu.Item>
              </Menu>
            </template>
          </Dropdown>
        </div>
        <Tree
          :auto-expand-parent="autoExpandParent"
          :block-node="true"
          :expanded-keys="expandedKeys"
          :tree-data="gData"
          class="mt-3"
          @expand="onExpand"
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
      </div>

      <div class="col-span-8 xl:col-span-9">
        <div class="bg-card">
          <Tabs v-model:active-key="activeKey" class="px-3">
            <Tabs.TabPane key="1" :tab="$t('abp.organizationunit.member')">
              <UserGrid>
                <template #toolbar-actions>
                  <Button type="primary" @click="addUsersModalApi.open">
                    {{ $t('common.add') }}
                  </Button>
                </template>
                <template #action="{ row }">
                  <Button type="link" @click="removeUser(row)">
                    {{ $t('common.delete') }}
                  </Button>
                </template>
              </UserGrid>
            </Tabs.TabPane>
            <Tabs.TabPane key="2" :tab="$t('abp.organizationunit.role')">
              <RolesGrid>
                <template #toolbar-actions>
                  <Button type="primary" @click="addRolesModalApi.open">
                    {{ $t('common.add') }}
                  </Button>
                </template>

                <template #action="{ row }">
                  <Button type="link" @click="removeRole(row)">
                    {{ $t('common.delete') }}
                  </Button>
                </template>
              </RolesGrid>
            </Tabs.TabPane>
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
