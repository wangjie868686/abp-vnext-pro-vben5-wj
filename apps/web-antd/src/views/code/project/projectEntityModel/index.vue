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
  postEntityModelsTree,
  postEntityModelsPageProperty,

  postOrganizationUnitsAddRoleToOrganizationUnitAsync,
  postOrganizationUnitsAddUserToOrganizationUnit,
  postOrganizationUnitsCreate,
  postOrganizationUnitsDelete,
  postOrganizationUnitsGetUsers,
  type TreeOutput,
} from '#/api-client/index';
import { $t } from '#/locales';
import { useRoute } from 'vue-router';
import ContextMenu from './ContextMenu.vue';
import AddOaggregateRoot from './AddOaggregateRootModal.vue';
import EntityAddEditModal from './EntityAddEditModal.vue';
import AddEditEntity from './AddEditEntityModal.vue';

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
const route = useRoute();
console.log(route)
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
      addEditEntityModalApi.setData({
        isEdit: false,
      });
      addEditEntityModalApi.open();
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

const dataList = ref<DataNode[]>([]);

const generateList = (data: TreeProps['treeData']) => {
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
  tree: TreeProps['treeData'],
): string | number | undefined => {
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
  if (!value) {
    expandedKeys.value = [];
    return;
  }
  
  const expanded = dataList.value
    .map((item) => {
      if (typeof item.title === 'string' && item.title.toLowerCase().indexOf(value.toLowerCase()) > -1) {
        return getParentKey(item.key, gData.value as TreeProps['treeData']);
      }
      return null;
    })
    .filter((item, i, self): item is string | number => 
      item !== null && item !== undefined && self.indexOf(item) === i
    );
    
  expandedKeys.value = expanded;
  autoExpandParent.value = true;
});

async function getTreeData() {
  const { data = [] } = await postEntityModelsTree({ body: { projectId: route.query.projectId} });
  gData.value = data;
  dataList.value = [];
  generateList(data as TreeProps['treeData']);
}

onMounted(() => {
  getTreeData();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const [AddOaggregateRootModal, addOaggregateRootModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: AddOaggregateRoot,
});

const [EntityAddEditModalComponent, orgTreeEditModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: EntityAddEditModal,
});

const [AddEditEntityModal, addEditEntityModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: AddEditEntity,
});

const propertyFormOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      fieldName: 'filter',
      label: '关键字',
      labelWidth: 50,
      componentProps: {
        allowClear: true,
      },
    },
  ],
  showDefaultActions: true,
  submitOnEnter: true,
  showCollapseButton: false,
};

const propertyGridOptions: VxeGridProps<any> = {
  columns: [
    { type: 'seq', title: $t('common.seq'), width: '50' },
    {
      field: 'code',
      title: $t('abp.dataDictionary.code'),
      minWidth: '200',
    },
    {
      field: 'description',
      title: $t('common.description'),
      minWidth: '200',
    },
    {
      field: 'dataTypeDescription',
      title: $t('abp.message.type'),
      minWidth: '150',
    },
    {
      field: 'isRequired',
      title: '是否必填',
      minWidth: '150',
    },
    {
      field: 'maxLength',
      title: '最大长度',
      minWidth: '150',
    },
    {
      field: 'minLength',
      title: '最小长度',
      minWidth: '150',
    },
    {
      field: 'decimalPrecision',
      title: '精度(18,6)中的18',
      minWidth: '150',
    },
    {
      field: 'decimalScale',
      title: '精度(18,6)中的6',
      minWidth: '150',
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
        const { data } = await postEntityModelsPageProperty({
          body: {
            pageIndex: page.currentPage,
            pageSize: page.pageSize,
            id: currentSelectedKey.value,
            ...formValues,
          },
        });
        return data;
      },
    },
  },
};

const [PropertyGrid, propertyGridApi] = useVbenVxeGrid({
  gridOptions: propertyGridOptions,
  formOptions: propertyFormOptions,
});

const onSelect = (keys: string[], event: any) => {
  currentSelectedKey.value = keys[0] ?? '';
  parentDisplayName.value = event.node.title;
  if (!keys[0]) return;
};

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
          <Button
            class="mx-3"
            size="small"
            type="primary"
            @click="addOaggregateRootModalApi.open"
          >
            <!-- {{ $t('abp.organizationunit.add') }} -->
              <div class="flex items-center">
                <span class="icon-[material-symbols--add-circle-outline]"></span>
                <span class="ml-1">新增聚合根</span>
              </div>
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
            <Tabs.TabPane key="1" :tab="'属性'">
              <PropertyGrid>
                <template #toolbar-tools>
                  <Button type="primary">
                    <!-- {{ $t('common.add') }} -->
                      新增实体属性
                  </Button>
                </template>
                <template #action="{ row }">
                  <Button type="link">
                    {{ $t('common.delete') }}
                  </Button>
                </template>
              </PropertyGrid>
            </Tabs.TabPane>
            <Tabs.TabPane key="2" :tab="'枚举'">
              <!-- <RolesGrid>
                <template #toolbar-tools>
                  <Button type="primary" :disabled="!currentSelectedKey" @click="addRolesModalApi.open">
                    {{ $t('common.add') }}
                  </Button>
                </template>

                <template #action="{ row }">
                  <Button type="link" @click="removeRole(row)">
                    {{ $t('common.delete') }}
                  </Button>
                </template>
              </RolesGrid> -->
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    </div>
    <AddOaggregateRootModal :projectId="route.query.projectId" @getTreeData="getTreeData" />
    <AddEditEntityModal />
    <EntityAddEditModalComponent @get-tree-data="getTreeData" />
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
