<script setup lang="ts">
import type { TreeProps } from 'ant-design-vue';
import type { DataNode } from 'ant-design-vue/es/tree';

import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page, useVbenModal, type VbenFormProps } from '@vben/common-ui';

import {
  Button,
  Dropdown,
  Input,
  Menu,
  message as Message,
  message,
  Modal,
  Spin,
  Tabs,
  Tree,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  postEntityModelsDeleteAggregate,
  postEntityModelsDeleteEntityModel,
  postEntityModelsDeleteEntityModelProperty,
  postEntityModelsPageProperty,
  postEntityModelsTree,
  postEnumTypesDeleteEnumType,
  postEnumTypesDeleteEnumTypeProperty,
  postEnumTypesPage,
  postEnumTypesPageProperty,
} from '#/api-client/index';
import { $t } from '#/locales';

import AddAggregateRoot from './AddAggregateRootModal.vue';
import AddEditEntity from './AddEditEntityModal.vue';
import AddEditEntityProperty from './AddEditEntityPropertyModal.vue';
import AddEditEnumComponent from './AddEditEnumModal.vue';
import AddEditEnumPropertyComponent from './AddEditEnumPropertyModal.vue';

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
const loading = ref<boolean>(true);
onMounted(() => {
  getTreeData().then(() => {
    loading.value = false;
  });
});
const [AddAggregateRootModal, addAggregateRootModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: AddAggregateRoot,
});
const [AddEditEntityModal, addEditEntityModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: AddEditEntity,
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
            aggregateId: currentSelectedTreeNode.value?.parentId,
          };

          // 如果没有父节点，则不传aggregateId
          if (currentSelectedTreeNode.value?.parentId) {
            await postEntityModelsDeleteEntityModel({
              body: params,
            });
          } else {
            delete params.aggregateId;
            await postEntityModelsDeleteAggregate({
              body: params,
            });
          }
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
  key: number | string,
  tree: TreeProps['treeData'],
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
const onExpand = (keys: (number | string)[], info: any) => {
  expandedKeys.value = keys;
  autoExpandParent.value = false;
};

const onSelect = (keys: any[], event: any) => {
  currentSelectedKey.value = keys[0] ?? '';
  // parentDisplayName.value = event.node.title;
  if (!keys[0]) return '';
};

async function getTreeData() {
  const { data = [] } = await postEntityModelsTree({
    body: { projectId: route.query.projectId as string },
  });
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
      if (
        typeof item.title === 'string' &&
        item.title.toLowerCase().includes(value.toLowerCase())
      ) {
        return getParentKey(item.key, gData.value as TreeProps['treeData']);
      }
      return null;
    })
    .filter(
      (item, i, self): item is number | string =>
        item !== null && item !== undefined && self.indexOf(item) === i,
    );

  expandedKeys.value = expanded;
  autoExpandParent.value = true;
});

const propertyFormOptions: VbenFormProps = {
  resetButtonOptions: {
    show: false,
  },
  schema: [
    {
      component: 'Input',
      fieldName: 'filter',
      label: $t('common.keyword'),
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
      title: $t('abp.code.isRequired'),
      minWidth: '150',
    },
    {
      field: 'maxLength',
      title: $t('abp.code.maxLength'),
      minWidth: '150',
    },
    {
      field: 'minLength',
      title: $t('abp.code.minLength'),
      minWidth: '150',
    },
    {
      field: 'decimalPrecision',
      title: $t('abp.code.decimalPrecision18'),
      minWidth: '150',
    },
    {
      field: 'decimalScale',
      title: $t('abp.code.decimalPrecision6'),
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
        if (!currentSelectedKey.value) return;
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
});

const enumFormOptions: VbenFormProps = {
  resetButtonOptions: {
    show: false,
  },
  schema: [
    {
      component: 'Input',
      fieldName: 'filter',
      label: $t('common.keyword'),
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
    { type: 'radio', title: $t('common.seq'), width: '50' },
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
        if (!currentSelectedKey.value) return;
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

const currentEnumTypeId = ref<string>('');
const enumGridEvent = {
  radioChange: (values: any) => {
    currentEnumTypeId.value = values.row.id;
    enumPropertyGridApi.reload({
      id: values.row.id,
    });
  },
};

const [EnumGrid, enumGridApi] = useVbenVxeGrid({
  gridOptions: enumGridOptions,
  formOptions: enumFormOptions,
  gridEvents: enumGridEvent,
});

const enumPropertyFormOptions: VbenFormProps = {
  resetButtonOptions: {
    show: false,
  },
  schema: [
    {
      component: 'Input',
      fieldName: 'filter',
      label: $t('common.keyword'),
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
      minWidth: '100',
    },
    {
      field: 'value',
      title: '值',
      minWidth: '100',
    },
    {
      field: 'description',
      title: $t('common.description'),
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
        if (!currentEnumTypeId.value) return;
        const { data } = await postEnumTypesPageProperty({
          body: {
            pageIndex: page.currentPage,
            pageSize: page.pageSize,
            id: currentEnumTypeId.value,
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

const [AddEditEntityPropertyModal, addEditEntityPropertyModalApi] =
  useVbenModal({
    connectedComponent: AddEditEntityProperty,
  });

const openAddEntityPropertyModal = () => {
  if (!currentSelectedKey.value) {
    message.error('请先选择实体');
    return;
  }
  addEditEntityPropertyModalApi.setData({
    entityModelId: currentSelectedKey.value,
    isEdit: false,
  });
  addEditEntityPropertyModalApi.open();
};

const handleDeleteEntityModelProperty = async (row: Record<string, any>) => {
  Modal.confirm({
    title: `${$t('common.confirmDelete')}?`,
    onOk: async () => {
      await postEntityModelsDeleteEntityModelProperty({
        body: {
          propertyId: row.id,
          id: currentSelectedKey.value,
        },
      });
      message.success($t('common.deleteSuccess'));
      propertyGridApi.reload();
    },
  });
};

const handleEditEntityModelProperty = async (row: Record<string, any>) => {
  addEditEntityPropertyModalApi.setData({
    entityModelId: currentSelectedKey.value,
    isEdit: true,
    row,
  });
  addEditEntityPropertyModalApi.open();
};

const [AddEditEnumModal, addEditEnumModalApi] = useVbenModal({
  connectedComponent: AddEditEnumComponent,
});

const handleAddEnum = () => {
  if (!currentSelectedKey.value) {
    message.error($t('abp.code.pleaseSelectEntity'));
    return;
  }
  addEditEnumModalApi.setData({
    entityModelId: currentSelectedKey.value,
    projectId: route.query.projectId,
    isEdit: false,
  });
  addEditEnumModalApi.open();
};

const handleEditEnum = (row: Record<string, any>) => {
  addEditEnumModalApi.setData({
    isEdit: true,
    row,
  });
  addEditEnumModalApi.open();
};

const handleDeleteEnum = async (row: Record<string, any>) => {
  Modal.confirm({
    title: `${$t('common.confirmDelete')}?`,
    onOk: async () => {
      await postEnumTypesDeleteEnumType({
        body: { id: row.id, entityModelId: currentSelectedKey.value },
      });
      message.success($t('common.deleteSuccess'));
      enumGridApi.reload();
    },
  });
};

const [AddEditEnumPropertyModal, addEditEnumPropertyModalApi] = useVbenModal({
  connectedComponent: AddEditEnumPropertyComponent,
});

const handleAddEnumProperty = () => {
  if (!currentEnumTypeId.value) {
    message.error($t('abp.code.pleaseSelectEnum'));
    return;
  }
  addEditEnumPropertyModalApi.setData({
    enumTypeId: currentEnumTypeId.value,
    isEdit: false,
  });
  addEditEnumPropertyModalApi.open();
};

const handleEditEnumProperty = (row: Record<string, any>) => {
  addEditEnumPropertyModalApi.setData({
    isEdit: true,
    enumTypeId: currentEnumTypeId.value,
    row,
  });
  addEditEnumPropertyModalApi.open();
};

const handleDeleteEnumProperty = async (row: Record<string, any>) => {
  Modal.confirm({
    title: `${$t('common.confirmDelete')}?`,
    onOk: async () => {
      await postEnumTypesDeleteEnumTypeProperty({
        body: { id: row.id, enumTypeId: currentEnumTypeId.value },
      });
      message.success($t('common.deleteSuccess'));
      enumPropertyGridApi.reload();
    },
  });
};
</script>

<template>
  <Spin :spinning="loading" tip="loading...">
    <Page :auto-content-height="true">
      <div class="grid grid-cols-12 gap-4">
        <div class="bg-card col-span-4 xl:col-span-3">
          <div class="bg-card flex items-center justify-between p-3">
            <Button
              class="mx-3"
              size="small"
              type="primary"
              @click="addAggregateRootModalApi.open"
            >
              <div class="flex items-center">
                <span
                  class="icon-[material-symbols--add-circle-outline]"
                ></span>
                <span class="ml-1"> {{ $t('common.add') }}</span>
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
            @select="onSelect"
          >
            <template #title="{ title, key: treeKey, data: nodeData }">
              <Dropdown :trigger="['contextmenu']">
                <span
                  v-if="title.indexOf(searchValue) > -1"
                  class="block w-full"
                >
                  {{ title.substring(0, title.indexOf(searchValue)) }}
                  <span style="color: #f50">{{ searchValue }}</span>
                  {{
                    title.substring(
                      title.indexOf(searchValue) + searchValue.length,
                    )
                  }}
                </span>
                <span v-else class="block w-full">{{ title }}</span>
                <template #overlay>
                  <Menu
                    @click="
                      ({ key: menuKey }) =>
                        onContextMenuClick(treeKey, nodeData, menuKey)
                    "
                  >
                    <Menu.Item
                      v-for="item in contextMenuOptions"
                      :key="item.key"
                    >
                      {{ item.label }}
                    </Menu.Item>
                  </Menu>
                </template>
              </Dropdown>
            </template>
          </Tree>
        </div>

        <div class="col-span-8 xl:col-span-9">
          <div class="bg-card">
            <Tabs v-model:active-key="activeKey" class="px-3">
              <Tabs.TabPane key="1" :tab="$t('abp.code.property')">
                <PropertyGrid>
                  <template #toolbar-tools>
                    <Button
                      :disabled="!currentSelectedKey"
                      type="primary"
                      @click="openAddEntityPropertyModal"
                    >
                      {{ $t('common.add') }}
                    </Button>
                  </template>
                  <template #action="{ row }">
                    <Button
                      type="link"
                      @click="handleEditEntityModelProperty(row)"
                    >
                      {{ $t('common.edit') }}
                    </Button>
                    <Button
                      danger
                      type="link"
                      @click="handleDeleteEntityModelProperty(row)"
                    >
                      {{ $t('common.delete') }}
                    </Button>
                  </template>
                </PropertyGrid>
              </Tabs.TabPane>
              <Tabs.TabPane key="2" :tab="$t('abp.code.enum')">
                <div class="grid grid-cols-12 gap-4">
                  <div class="bg-card col-span-6">
                    <EnumGrid>
                      <template #toolbar-tools>
                        <Button type="primary" @click="handleAddEnum">
                          {{ $t('common.add') }}
                        </Button>
                      </template>

                      <template #action="{ row }">
                        <Button type="link" @click="handleEditEnum(row)">
                          {{ $t('common.edit') }}
                        </Button>
                        <Button
                          danger
                          type="link"
                          @click="handleDeleteEnum(row)"
                        >
                          {{ $t('common.delete') }}
                        </Button>
                      </template>
                    </EnumGrid>
                  </div>
                  <div class="bg-card col-span-6">
                    <EnumPropertyGrid>
                      <template #toolbar-tools>
                        <Button type="primary" @click="handleAddEnumProperty">
                          {{ $t('common.add') }}
                        </Button>
                      </template>

                      <template #action="{ row }">
                        <Button
                          type="link"
                          @click="handleEditEnumProperty(row)"
                        >
                          {{ $t('common.edit') }}
                        </Button>
                        <Button
                          danger
                          type="link"
                          @click="handleDeleteEnumProperty(row)"
                        >
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
      <AddAggregateRootModal
        :project-id="route.query.projectId"
        @get-tree-data="getTreeData"
      />
      <AddEditEntityModal @get-tree-data="getTreeData" />
      <AddEditEntityPropertyModal @reload="propertyGridApi.reload" />
      <AddEditEnumModal @reload="enumGridApi.reload" />
      <AddEditEnumPropertyModal @reload="enumPropertyGridApi.reload" />
    </Page>
  </Spin>
</template>

<style scoped></style>
