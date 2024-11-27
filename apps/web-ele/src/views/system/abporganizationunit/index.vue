<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { Page, useVbenModal, type VbenFormProps } from '@vben/common-ui';
import {
  ElButton as Button,
  ElCol as Col,
  ElRow as Row,
  ElDropdown as Dropdown,
  ElDropdownMenu as Menu,
  ElDropdownItem as MenuItem,
  ElSpace as Space,
  ElInput as Input,
  ElTree as Tree,
  ElTabs as Tabs,
  ElTabPane as TabPane,
  ElMessageBox,
  ElMessage,
  ElText,
} from 'element-plus';
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

// import ContextMenu from './ContextMenu.vue';
import OrgTreeAddModalComponent from './OrgTreeAddModal.vue';
import OrgTreeEditModalComponent from './OrgTreeEditModal.vue';
const searchValue = ref<string>('');
const gData = ref<Array<TreeOutput>>([]);
const activeKey = ref('1');
const currentSelectedKey = ref('');
const parentDisplayName = ref('');
const selectRoles = ref();
const selectUsers = ref();
const orgTreeRef = ref<InstanceType<typeof Tree>>();

const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  node: null as any,
});

const contextMenuOptions = [
  { label: $t('common.add'), key: 'add' },
  { label: $t('common.edit'), key: 'edit' },
  { label: $t('common.delete'), key: 'delete' },
];

function onRightClick(event: MouseEvent, node: any) {
  event.preventDefault();
  event.stopPropagation();

  currentSelectedKey.value = node.key;
  parentDisplayName.value = node.label || node.title;

  // 设置右键菜单位置和节点信息
  contextMenu.visible = true;
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
  contextMenu.node = node;
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
      ElMessageBox.confirm(
        `${$t('common.confirmDelete')}?`,
        $t('common.warning'),
        {
          type: 'warning',
        }
      ).then(async () => {
        await postOrganizationUnitsDelete({
          body: {
            id: currentSelectedKey.value,
          },
        });
        ElMessage({
          message: $t('common.success'),
          type: 'success',
        });
        currentSelectedKey.value = '';
        getTreeData();
      }).catch(() => {
        // 取消删除操作
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

const handleClickOutside = (event: MouseEvent) => {
  // 检查点击是否在菜单外部
  const menu = document.querySelector('.context-menu');
  if (contextMenu.visible && menu && !menu.contains(event.target as Node)) {
    closeContextMenu();
  }
};

const closeContextMenu = () => {
  contextMenu.visible = false;
};

const dataList = ref<any[]>([]);

const generateList = (data: any) => {
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
  key: string | number,
  tree: any,
): string | number | undefined => {
  if (!tree) return undefined;
  let parentKey;
  for (const node of tree) {
    if (node.children) {
      if (node.children.some((item: { key: string | number }) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};

// 获取所有节点的 key
const getAllKeys = (nodes: any[]): (string | number)[] => {
  let keys: (string | number)[] = [];
  nodes.forEach(node => {
    if (node.key) {
      keys.push(node.key);
    }
    if (node.children && node.children.length) {
      keys = keys.concat(getAllKeys(node.children));
    }
  });
  return keys;
};

// 展开所有节点
const expandAll = () => {
  if (orgTreeRef.value) {
    // 递归设置所有节点的展开状态
    const setExpand = (data: any[]) => {
      data.forEach(node => {
        orgTreeRef.value!.store.nodesMap[node.key].expanded = true;
        if (node.children && node.children.length) {
          setExpand(node.children);
        }
      });
    };
    setExpand(gData.value);
  }
};

// 折叠所有节点
const collapseAll = () => {
  if (orgTreeRef.value) {
    // 递归设置所有节点的折叠状态
    const setCollapse = (data: any[]) => {
      data.forEach(node => {
        orgTreeRef.value!.store.nodesMap[node.key].expanded = false;
        if (node.children && node.children.length) {
          setCollapse(node.children);
        }
      });
    };
    setCollapse(gData.value);
  }
};

interface Tree {
  [key: string]: any
}

const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data.title.includes(value)
}

watch(searchValue, (val) => {
  orgTreeRef.value!.filter(val)
})

async function getTreeData() {
  const { data = [] } = await postOrganizationUnitsTree();
  gData.value = data;
  dataList.value = [];
  generateList(data);
}

onMounted(() => {
  getTreeData();
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('contextmenu', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('contextmenu', handleClickOutside);
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
      ElMessage({
        type: 'success',
        message: $t('common.success'),
      })
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

const onSelect = (node: any) => {
  console.log(node);
  currentSelectedKey.value = node.key ?? '';
  parentDisplayName.value = node.title;
  if (!node.key) return;
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
      ElMessage({
        message: $t('common.add'),
        type: 'success',
      })
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
      ElMessage({
        message: $t('common.add'),
        type: 'success',
      })
    } finally {
      addUsersModalApi.setState({ loading: false, confirmLoading: false });
    }
  },
});

function removeRole(row: Record<string, any>) {
  ElMessageBox.confirm(
    `${$t('common.confirmDelete')}${row.name} ?`,
    { type: 'warning' }
  ).then(async () => {
    await postOrganizationUnitsRemoveRoleFromOrganizationUnitAsync({
      body: {
        roleId: row.id,
        organizationUnitId: currentSelectedKey.value,
      },
    });
    rolesGridApi.reload();
    ElMessage({
      message: $t('common.success'),
      type: 'success',
    })
  });
}

function removeUser(row: Record<string, any>) {
  ElMessageBox.confirm(
    `${$t('common.confirmDelete')}${row.userName} ?`,
    { type: 'warning' }
  ).then(async () => {
    await postOrganizationUnitsRemoveUserFromOrganizationUnit({
      body: {
        userId: row.id,
        organizationUnitId: currentSelectedKey.value,
      },
    });
    userGridApi.reload();
    ElMessage({
      message: $t('common.success'),
      type: 'success',
    })
  })
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
          <Input v-model="searchValue" class="ml-1 flex-1" />
          <Dropdown class="ml-1">
            <Button class="font-bold">......</Button>
            <template #dropdown>
              <Menu>
                <MenuItem @click="expandAll">
                  {{ $t('common.expandAll') }}
                </MenuItem>
                <MenuItem @click="collapseAll">
                  {{ $t('common.collapseAll') }}
                </MenuItem>
              </Menu>
            </template>
          </Dropdown>
        </div>
        <Tree
          class="mt-3"
          ref="orgTreeRef"
          node-key="key"
          :props="{ label: 'title', children: 'children' }"
          :data="gData"
          :filter-node-method="filterNode"
          :highlight-current="true"
          :check-on-click-node="true"
          @node-contextmenu="onRightClick"
          @node-click="onSelect"
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
          <Tabs v-model="activeKey" class="px-3">
            <TabPane key="1" :label="$t('abp.organizationunit.member')">
              <UserGrid>
                <template #toolbar-actions>
                  <Button type="primary" :disabled="!currentSelectedKey" @click="addUsersModalApi.open">
                    {{ $t('common.add') }}
                  </Button>
                </template>
                <template #action="{ row }">
                  <Button text type="danger" @click="removeUser(row)">
                    {{ $t('common.delete') }}
                  </Button>
                </template>
              </UserGrid>
            </TabPane>
            <TabPane key="2" :label="$t('abp.organizationunit.role')">
              <RolesGrid>
                <template #toolbar-actions>
                  <Button type="primary" :disabled="!currentSelectedKey" @click="addRolesModalApi.open">
                    {{ $t('common.add') }}
                  </Button>
                </template>

                <template #action="{ row }">
                  <Button text type="danger" @click="removeRole(row)">
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
    <div
      v-if="contextMenu.visible"
      class="fixed bg-white shadow-md rounded-md py-2 z-50"
      :style="{
        left: contextMenu.x + 'px',
        top: contextMenu.y + 'px'
      }"
    >
      <div
        v-for="option in contextMenuOptions"
        :key="option.key"
        class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        @click="onContextMenuSelect(option.key)"
      >
        {{ option.label }}
      </div>
    </div>
  </Page>
</template>

<style scoped></style>
