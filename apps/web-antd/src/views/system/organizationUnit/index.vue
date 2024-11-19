<template>
  <Page :autoContentHeight="true">
    <Row :gutter="16">
      <Col :span="6" :lg="8">
      <div class="flex justify-between items-center bg-card p-3">
        <span class="text-lg">组织机构</span>
        <Button class="mx-3" type="primary" size="small" @click="orgModalApi.open">新增根机构</Button>
        <Input.Search v-model:value="searchValue" class="flex-1 ml-1" placeholder="搜索" />
        <Dropdown class="ml-1">
          <Button class="font-bold">
            ...
          </Button>
          <template #overlay>
            <Menu>
              <Menu.Item>展开全部</Menu.Item>
              <Menu.Item>折叠全部</Menu.Item>
            </Menu>
          </template>
        </Dropdown>
      </div>
      <Tree class="mt-3" :expanded-keys="expandedKeys" :auto-expand-parent="autoExpandParent" :tree-data="gData"
        @select="onSelect"
        @expand="onExpand">
        <template #title="{ title }">
          <span v-if="title.indexOf(searchValue) > -1">
            {{ title.substring(0, title.indexOf(searchValue)) }}
            <span style="color: #f50">{{ searchValue }}</span>
            {{ title.substring(title.indexOf(searchValue) + searchValue.length) }}
          </span>
          <span v-else>{{ title }}</span>
        </template>
      </Tree>
      </Col>
      <Col :span="16" :lg="14">
        <div class="bg-card px-3">
          <Tabs v-model:activeKey="activeKey">
            <Tabs.TabPane key="1" tab="成员">
              <UserGrid>
                <template #toolbar-actions>
                  <Button type="primary" @click="">新增</Button>
                </template>
              </UserGrid>
            </Tabs.TabPane>
            <Tabs.TabPane key="2" tab="角色">
              <RolesGrid>
                <template #toolbar-actions>
                  <Button type="primary" @click="addRolesModalApi.open">新增</Button>
                </template>
              </RolesGrid>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Col>
    </Row>

    <OrgAddModal class="w-[600px]" title="新增"> 
      <OrgAddForm ></OrgAddForm>
    </OrgAddModal>

    <AddRolesModal>
      <UnAddRolesTable>

      </UnAddRolesTable>
    </AddRolesModal>
  </Page>
</template>

<script setup lang="ts">
import { Row, Col, Space, Button, Dropdown, Menu, Input, Modal, Tree, Tabs, message as Message } from 'ant-design-vue';
import { Page, useVbenModal, VbenButton, type VbenFormProps } from '@vben/common-ui';
import type { TreeProps } from 'ant-design-vue';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { useVbenForm, z } from '#/adapter/form';
import {
  postOrganizationUnitsTree, type TreeOutput,
  postOrganizationUnitsGetRoles,
  postOrganizationUnitsGetUsers,
  postOrganizationUnitsCreate,
  postOrganizationUnitsGetUnAddRoles,
  postOrganizationUnitsGetUnAddUsers,
  postOrganizationUnitsAddRoleToOrganizationUnitAsync,
} from '#/api-client/index';
import { onMounted, ref, watch } from 'vue';


// const { isDark } = usePreferences();
const selectedKeys = ref([]);
const expandedKeys = ref<(string | number)[]>([]);
const searchValue = ref<string>('');
const autoExpandParent = ref<boolean>(true);
const gData = ref<Array<TreeOutput>>([]);
const activeKey = ref('1');
const currentSelectedKey = ref('');
const selectRoles = ref();

async function getTreeData() {
  const { data = [] } = await postOrganizationUnitsTree();
  gData.value = data;
  generateList(data);
}

onMounted(async () => {
  getTreeData();
});

const dataList: TreeProps['treeData'] = [];
const generateList = (data: TreeProps['treeData']) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const key = node.key;
    dataList.push({ key, title: key });
    if (node.children) {
      generateList(node.children);
    }
  }
};

const getParentKey = (
  key: string | number,
  tree: TreeProps['treeData'],
): string | number | undefined => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};


const onExpand = (keys: string[]) => {
  expandedKeys.value = keys;
  autoExpandParent.value = false;
};

watch(searchValue, value => {
  const expanded = dataList
    .map((item: TreeProps['treeData'][number]) => {
      if (item.title.indexOf(value) > -1) {
        return getParentKey(item.key, gData.value);
      }
      return null;
    })
    .filter((item, i, self) => item && self.indexOf(item) === i);
  expandedKeys.value = expanded;
  searchValue.value = value;
  autoExpandParent.value = true;
});

const [OrgAddModal, orgModalApi] = useVbenModal({
  onConfirm: async () => {
    const { valid }  = await orgFormApi.validate();
    if (!valid) return;
    try {
      orgModalApi.setState({ loading: true, confirmLoading: true });
      const values = await orgFormApi.getValues();
      await postOrganizationUnitsCreate({
        body: { ...values }
      })
      getTreeData();
      Message.success('新增成功');
      orgModalApi.close();
    } finally {
      orgModalApi.setState({ loading: false, confirmLoading: false });
    }
  }
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
      label: '',
      componentProps: {
        allowClear: true,
      }
    }],
  wrapperClass: 'grid-cols-2',
  showDefaultActions: true,
  submitOnEnter: true,
  showCollapseButton: false,
  commonConfig: {
    hideLabel: true,
  }
};

const userGridOptions: VxeGridProps<any> = {
  columns: [
    { type: 'radio', width: '50', },
    { field: 'userName', title: '用户名', minWidth: '200', },
    { field: 'email', title: '邮箱', minWidth: '200', },
    {
      title: '操作',
      field: 'action',
      fixed: 'right',
      width: '150',
      slots: { default: 'action' },
    },
  ],
  minHeight: '500',
  keepSource: true,
  pagerConfig: {},
  radioConfig: {
    highlight: true,
  },
  proxyConfig: {
    response: {
      total: 'totalCount'
    },
    ajax: {
      query: async ({ page }, formValues) => {
        if (!currentSelectedKey.value) return;
        const { data } = await postOrganizationUnitsGetUsers({
          body: {
            pageIndex: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
            organizationUnitId: currentSelectedKey.value
          }
        });
        return data;
      },
    },
  },
};

const [UserGrid, userGridApi] = useVbenVxeGrid({ gridOptions: userGridOptions, formOptions: userFormOptions, });

const rolesGridOptions: VxeGridProps<any> = {
  columns: [
  { title: '序号', type: 'seq', width: 50 },
    { field: 'codeName', title: '角色名称', minWidth: '200', },
    {
      title: '操作',
      field: 'action',
      fixed: 'right',
      width: '70',
      slots: { default: 'action' },
    },
  ],
  minHeight: '500',
  keepSource: true,
  pagerConfig: {},
  radioConfig: {
    highlight: true,
  },
  proxyConfig: {
    response: {
      total: 'totalCount'
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
          }
        });
        return data;
      },
    },
  },
};

const [RolesGrid, rolesGridApi] = useVbenVxeGrid({ gridOptions: rolesGridOptions, });

const onSelect = (keys: string[], event: any) => {
  currentSelectedKey.value = keys[0] ?? '';
  if (!keys[0]) return;
  activeKey.value === '1' ? userGridApi.reload() : rolesGridApi.reload();
}

const [AddRolesModal, addRolesModalApi] = useVbenModal({
  onConfirm: async () => {
    try {
      addRolesModalApi.setState({ loading: true, confirmLoading: true });
      await postOrganizationUnitsAddRoleToOrganizationUnitAsync({
        body: {
          roleId: selectRoles.value.map((item: { id: string; }) => item.id),
          organizationUnitId: currentSelectedKey.value,
        }
      });
      addRolesModalApi.close();
      unAddRolesTableApi.reload();
      Message.success('添加成功');
      
    } finally {
      addRolesModalApi.setState({ loading: false, confirmLoading: false });
    }
  }
});

const unAddRolesOptions: VxeGridProps<any> = {
  columns: [
    { title: '', type: 'checkbox', width: 50 },
    { field: 'name', title: '角色名称', minWidth: '200', },
  ],
  minHeight: '500',
  keepSource: true,
  pagerConfig: {},
  radioConfig: {
    highlight: true,
  },
  proxyConfig: {
    response: {
      total: 'totalCount'
    },
    ajax: {
      query: async ({ page },) => {
        if (!currentSelectedKey.value) return;
        const { data } = await postOrganizationUnitsGetUnAddRoles({
          body: {
            pageIndex: page.currentPage,
            pageSize: page.pageSize,
            organizationUnitId: currentSelectedKey.value,
          }
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
  }
}

const [UnAddRolesTable, unAddRolesTableApi] = useVbenVxeGrid({ gridOptions: unAddRolesOptions, gridEvents: unAddRolesTableEvents });
</script>

<style scoped></style>
