<script setup lang="ts">
import type { TreeProps } from 'ant-design-vue';

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
  { label: '新增', key: 'add' },
  { label: '编辑', key: 'edit' },
  { label: '删除', key: 'delete' },
];

function onRightClick({ event, node }) {
  event.preventDefault();
  event.stopPropagation();
  if (!currentSelectedKey.value) {
    Message.warning('请先选择一个节点再进行操作');
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
        title: '提示',
        content: '确认删除吗?',
        onOk: async () => {
          await postOrganizationUnitsDelete({
            body: {
              id: currentSelectedKey.value,
            },
          });
          Message.success('删除成功');
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
  generateList(data);
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

// 写一个方法，获取treeData中所有父节点的key
const getAllParentKeys = (
  key: number | string,
  tree: TreeProps['treeData'],
) => {
  const parentKeys: (number | string)[] = [];
  const getParentKey = (key: number | string, tree: TreeProps['treeData']) => {
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some((item) => item.key === key)) {
          parentKeys.push(node.key);
          getParentKey(node.key, tree);
        } else {
          getParentKey(key, node.children);
        }
      }
    }
  };
  getParentKey(key, tree);
  return parentKeys;
};

const toggleExpand = () => {
  expandedKeys.value =
    expandedKeys.value.length === 0
      ? getAllParentKeys(currentSelectedKey.value, gData.value)
      : [];
  console.log(expandedKeys.value);
};

const onExpand = (keys: string[]) => {
  expandedKeys.value = keys;
  autoExpandParent.value = false;
};

watch(searchValue, (value) => {
  const expanded = dataList
    .map((item: TreeProps['treeData'][number]) => {
      if (item.title.includes(value)) {
        return getParentKey(item.key, gData.value);
      }
      return null;
    })
    .filter((item, i, self) => item && self.indexOf(item) === i);
  expandedKeys.value = expanded;
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
      Message.success('新增成功');
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
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'displayName',
      label: '名称·',
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
      label: '用户名',
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
    { type: 'seq', title: '序号', width: '50' },
    { field: 'userName', title: '用户名', minWidth: '200' },
    { field: 'email', title: '邮箱', minWidth: '200' },
  ],
  minHeight: '500',
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
    { title: '序号', type: 'seq', width: 50 },
    { field: 'name', title: '角色名称', minWidth: '200' },
  ],
  minHeight: '500',
  keepSource: true,
  pagerConfig: {},
  radioConfig: {
    highlight: true,
  },
  proxyConfig: {
    response: {
      total: 'totalCount',
    },
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
      Message.success('添加成功');
    } finally {
      addRolesModalApi.setState({ loading: false, confirmLoading: false });
    }
  },
});

const unAddRolesOptions: VxeGridProps<any> = {
  columns: [
    { title: '', type: 'checkbox', width: 50 },
    { field: 'name', title: '角色名称', minWidth: '200' },
  ],
  minHeight: '500',
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
    console.log(records);
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
      label: '用户名',
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
    { field: 'userName', title: '用户名', minWidth: '150' },
    { field: 'email', title: '邮箱', minWidth: '200' },
  ],
  minHeight: '500',
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
      Message.success('添加成功');
    } finally {
      addUsersModalApi.setState({ loading: false, confirmLoading: false });
    }
  },
});

function removeRole(row: Record<string, any>) {
  Modal.confirm({
    title: '提示',
    content: `确定要删除角色${row.name}吗？`,
    onOk: async () => {
      try {
        await postOrganizationUnitsRemoveRoleFromOrganizationUnitAsync({
          body: {
            roleId: row.id,
            organizationUnitId: currentSelectedKey.value,
          },
        });
        unAddRolesTableApi.reload();
        Message.success('删除成功');
      } catch (error) {
        console.log(error);
      }
    },
  });
}

function removeUser(row: Record<string, any>) {
  Modal.confirm({
    title: '提示',
    content: `确定要删除用户${row.userName}吗？`,
    onOk: async () => {
      try {
        await postOrganizationUnitsRemoveUserFromOrganizationUnit({
          body: {
            userId: row.id,
            organizationUnitId: currentSelectedKey.value,
          },
        });
        unAddUsersTableApi.reload();
        Message.success('删除成功');
      } catch (error) {
        console.log(error);
      }
    },
  });
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="grid grid-cols-12 gap-4">
      <div class="bg-card col-span-4 xl:col-span-3">
        <div class="bg-card flex items-center justify-between p-3">
          <span class="text-lg">组织机构</span>
          <Button
            class="mx-3"
            size="small"
            type="primary"
            @click="orgModalApi.open"
          >
            新增根机构
          </Button>
          <Input.Search
            v-model:value="searchValue"
            class="ml-1 flex-1"
            placeholder="搜索"
          />
          <Dropdown class="ml-1">
            <Button class="font-bold"> ... </Button>
            <template #overlay>
              <Menu>
                <Menu.Item @click="toggleExpand">展开全部</Menu.Item>
                <Menu.Item @click="toggleExpand">折叠全部</Menu.Item>
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
            <Tabs.TabPane key="1" tab="成员">
              <UserGrid>
                <template #toolbar-actions>
                  <Button type="primary" @click="addUsersModalApi.open">
                    新增
                  </Button>
                </template>
                <template #action="{ row }">
                  <Button type="link" @click="removeUser(row)">
                    {{ $t('common.delete') }}
                  </Button>
                </template>
              </UserGrid>
            </Tabs.TabPane>
            <Tabs.TabPane key="2" tab="角色">
              <RolesGrid>
                <template #toolbar-actions>
                  <Button type="primary" @click="addRolesModalApi.open">
                    新增
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

    <OrgAddModal class="w-[600px]" title="新增">
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
