<script setup lang="ts">
import type { TreeProps } from 'ant-design-vue';
import type { DataNode } from 'ant-design-vue/es/tree';
import { onMounted, reactive, ref, watch } from 'vue';
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
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  postEntityModelsTree,
  postEntityModelsPageProperty,
  postEntityModelsDeleteEntityModel,
  postEnumTypesPage,
  postEnumTypesPageProperty,
  type TreeOutput,
} from '#/api-client/index';
import { $t } from '#/locales';
import { useRoute } from 'vue-router';
import AddOaggregateRoot from './AddOaggregateRootModal.vue';
import AddEditEntity from './AddEditEntityModal.vue';
import AddEntityProperty from './AddEntityPropertyModal.vue';

// 定义一个响应式变量，用于存储展开的节点
const expandedKeys = ref<(number | string)[]>([]);
// 定义一个响应式变量，用于存储搜索框的值
const searchValue = ref<string>('');
// 定义一个响应式变量，用于控制是否自动展开父节点
const autoExpandParent = ref<boolean>(true);
// 定义一个响应式变量，用于存储树形数据
const gData = ref<Array<DataNode>>([]);
// 定义一个响应式变量，用于存储当前激活的tab
const activeKey = ref('1');
// 定义一个响应式的变量，用于存储当前选中的节点的key
const currentSelectedKey = ref('');
// 定义一个响应式的变量，用于存储当前选中的节点
const currentSelectedTreeNode = ref();
const route = useRoute();

const contextMenuOptions = [
  { label: $t('common.add'), key: 'add' },
  { label: $t('common.edit'), key: 'edit' },
  { label: $t('common.delete'), key: 'delete' },
];

onMounted(() => {
  getTreeData();
});

// 定义一个异步函数，用于处理右键菜单的选择
const onContextMenuSelect = async (key: string) => {
  // 根据选择的key值，执行不同的操作
  switch (key) {
    // 如果选择的key值为add，则打开添加编辑实体模态框
    case 'add': {
      addEditEntityModalApi.setData({
        isEdit: false,
        id: currentSelectedKey.value,
      });
      addEditEntityModalApi.open();
      break;
    }
    // 如果选择的key值为delete，则弹出确认框，确认后执行删除操作
    case 'delete': {
      Modal.confirm({
        title: `${$t('common.confirmDelete')}?`,
        onOk: async () => {
          // 构造删除实体的参数
          const params = {
            id: currentSelectedTreeNode.value.key,
            aggregateId: currentSelectedTreeNode.value?.parentId
          };
          // 如果没有父节点，则不传aggregateId
          !currentSelectedTreeNode.value?.parentId && delete params.aggregateId;
          await postEntityModelsDeleteEntityModel({
            body: params
          });
          Message.success($t('common.success'));
          currentSelectedKey.value = '';
          currentSelectedTreeNode.value = null;
          getTreeData();
        },
      });
      break;
    }
    case 'edit': {
      // 设置编辑实体模态框的数据
      addEditEntityModalApi.setData({
        isEdit: true, // 设置为编辑状态
        isRoot: !currentSelectedTreeNode.value?.parentId, // 判断是否为根节点
        id: currentSelectedKey.value, // 设置实体id
        row: currentSelectedTreeNode.value, // 设置实体数据
      });
      // 打开编辑实体模态框
      addEditEntityModalApi.open();
      break;
    }
  }
};
// 当右键菜单点击时，执行该函数
const onContextMenuClick = (treeKey: string, nodeData: any, menuKey: any) => {
  // 将当前选中的树节点key赋值给currentSelectedKey
  currentSelectedKey.value = treeKey;
  // 将当前选中的树节点数据赋值给currentSelectedTreeNode
  currentSelectedTreeNode.value = nodeData;
  // 调用onContextMenuSelect函数，传入menuKey
  onContextMenuSelect(menuKey);
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

// 添加 onExpand 方法处理节点展开/折叠
const onExpand = (keys: (string | number)[], info: any) => {
  expandedKeys.value = keys;
  autoExpandParent.value = false;
};

const onSelect = (keys: any[], event: any) => {
  currentSelectedKey.value = keys[0] ?? '';
  // parentDisplayName.value = event.node.title;
  if (!keys[0]) return;
};

async function getTreeData() {
  const { data = [] } = await postEntityModelsTree({ body: { projectId: route.query.projectId as string } });
  gData.value = data as DataNode[];
  dataList.value = [];
  generateList(data as TreeProps['treeData']);
}

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

const [AddOaggregateRootModal, addOaggregateRootModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: AddOaggregateRoot,
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
        if (!currentSelectedKey.value) return
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

watch(currentSelectedKey, () => {
  propertyGridApi.reload();
})

const enumFormOptions: VbenFormProps = {
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

const enumGridOptions: VxeGridProps<any> = {
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
        const { data } = await postEnumTypesPage({
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

const [EnumGrid, enumGridApi] = useVbenVxeGrid({
  gridOptions: enumGridOptions,
  formOptions: enumFormOptions,
});

const enumPropertyFormOptions: VbenFormProps = {
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

const enumPropertyGridOptions: VxeGridProps<any> = {
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
        const { data } = await postEnumTypesPage({
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

const [EnumPropertyGrid, enumPropertyGridApi] = useVbenVxeGrid({
  gridOptions: enumPropertyGridOptions,
  formOptions: enumPropertyFormOptions,
});

const [AddEntityPropertyModal, addEntityPropertyModalApi] = useVbenModal({
  connectedComponent: AddEntityProperty,
});

const openAddEntityPropertyModal = () => {
  addEntityPropertyModalApi.setData({
    entityModelId: currentSelectedKey.value,
  });
  addEntityPropertyModalApi.open();
}

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
          class="mt-3"
          :auto-expand-parent="autoExpandParent"
          :block-node="true"
          :expanded-keys="expandedKeys"
          :tree-data="gData"
          @expand="onExpand"
          @select="onSelect"
        >
          <template #title="{ title, key: treeKey, data: nodeData }">
            <Dropdown :trigger="['contextmenu']">
              <span class="w-full block" v-if="title.indexOf(searchValue) > -1">
                {{ title.substring(0, title.indexOf(searchValue)) }}
                <span style="color: #f50">{{ searchValue }}</span>
                {{
                  title.substring(title.indexOf(searchValue) + searchValue.length)
                }}
              </span>
              <span class="w-full block" v-else>{{ title }}</span>
              <template #overlay>
                <Menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, nodeData, menuKey)">
                  <Menu.Item v-for="item in contextMenuOptions" :key="item.key">{{ item.label }}</Menu.Item>
                </Menu>
              </template>
            </Dropdown>
          </template>
        </Tree>
      </div>

      <div class="col-span-8 xl:col-span-9">
        <div class="bg-card">
          <Tabs v-model:active-key="activeKey" class="px-3">
            <Tabs.TabPane key="1" :tab="'属性'">
              <PropertyGrid>
                <template #toolbar-tools>
                  <Button type="primary" :disabled="!currentSelectedKey" @click="openAddEntityPropertyModal">
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
              <div class="grid grid-cols-12 gap-4">
                <div class="bg-card col-span-6">
                  <EnumGrid>
                    <template #toolbar-tools>
                      <Button type="primary" @click="">
                        {{ '新增枚举' }}
                      </Button>
                    </template>

                    <template #action="{ row }">
                      <Button type="link" @click="">
                        {{ $t('common.edit') }}
                      </Button>
                      <Button danger type="link" @click="">
                        {{ $t('common.delete') }}
                      </Button>
                    </template>
                  </EnumGrid>
                </div>
                <div class="bg-card col-span-6">
                  <EnumPropertyGrid>
                    <template #toolbar-tools>
                      <Button type="primary" @click="">
                        {{ '新增枚举属性' }}
                      </Button>
                    </template>

                    <template #action="{ row }">
                      <Button type="link" @click="">
                        {{ $t('common.edit') }}
                      </Button>
                      <Button danger type="link" @click="">
                        {{ $t('common.delete') }}
                      </Button>
                    </template>
                  </EnumPropertyGrid>
                </div>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    </div>
    <AddOaggregateRootModal :projectId="route.query.projectId" @getTreeData="getTreeData" />
    <AddEditEntityModal @getTreeData="getTreeData" />
    <AddEntityPropertyModal />
  </Page>
</template>

<style scoped></style>
