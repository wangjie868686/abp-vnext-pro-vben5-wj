<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import {
  Button,
  Dropdown,
  Input,
  Menu,
  message as Message,
  Modal,
  Tree,
  message,
} from 'ant-design-vue';
import { postTemplatesTree, postTemplatesDeleteDetail } from '#/api-client/index';
import AddEditTemplateModal from './AddEditTemplateModal.vue';
import { useRoute } from 'vue-router';
import type { DataNode, TreeProps } from 'ant-design-vue/es/tree';
import { $t } from '@vben/locales';
import { useVbenModal } from '@vben/common-ui';
import { usePreferences } from '@vben/preferences';

const { isDark } = usePreferences();
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
const jsonData = ref();
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
      // addEditEntityModalApi.setData({
      //   isEdit: false,
      //   id: currentSelectedKey.value,
      // });
      // addEditEntityModalApi.open();
      break;
    }
    case 'delete': {
      Modal.confirm({
        title: `${$t('common.confirmDelete')}?`,
        onOk: async () => {
          const params = {
            templateId: route.query.templateId as string,
            templateDetailId: currentSelectedKey.value,
          };
          await postTemplatesDeleteDetail({
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
      addEditModalApi.setData({
        isEdit: true,
        templateId: route.query.templateId as string,
        templateDetailId: currentSelectedKey.value,
        row: currentSelectedTreeNode.value,
      });
      addEditModalApi.open();
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
  jsonData.value = event.node.content || {};
  jsonData.value = JSON.parse(JSON.stringify(jsonData.value));
  if (!keys[0]) return;
};

async function getTreeData() {
  const { data = [] } = await postTemplatesTree({ body: { templateId: route.query.templateId as string } });
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

const [AddEditModal, addEditModalApi] = useVbenModal({
  connectedComponent: AddEditTemplateModal,
});

const openTemplateModal = () => {
  addEditModalApi.setData({
    isEdit: false,
    templateId: route.query.templateId as string,
  });
  addEditModalApi.open();
}

</script>

<template>
    <div class="grid grid-cols-12 gap-4 m-4 min-h-[calc(100vh-120px)]">
      <div class="bg-card col-span-4 xl:col-span-3">
        <div class="bg-card flex items-center justify-between p-3">
          <Button
            class="mx-3"
            size="small"
            type="primary"
          >
              <div class="flex items-center">
                <span class="icon-[material-symbols--add-circle-outline]"></span>
                <span class="ml-1" @click="openTemplateModal">创建</span>
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

      <div class="col-span-8 xl:col-span-9 bg-card">
        <div class="bg-card">
          <JsonViewer class="h-full" :value="jsonData" copyable sort line-numbers :theme="isDark ? 'dark' : 'light'" />
        </div>
      </div>

      <AddEditModal @getTreeData="getTreeData" />
    </div>
</template>

<style scoped>
</style>
