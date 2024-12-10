<script setup lang="ts">
import type { DataNode, TreeProps } from 'ant-design-vue/es/tree';

import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { $t } from '@vben/locales';

import { Button, Dropdown, Input, Menu, Spin, Tree } from 'ant-design-vue';

import { postGeneratorPreViewCode } from '#/api-client/index';

// 定义一个响应式变量，用于存储展开的节点
const expandedKeys = ref<(number | string)[]>([]);
// 定义一个响应式变量，用于存储搜索框的值
const searchValue = ref<string>('');
// 定义一个响应式变量，用于控制是否自动展开父节点
const autoExpandParent = ref<boolean>(true);
// 定义一个响应式变量，用于存储树形数据
const gData = ref<Array<DataNode>>([]);
// 定义一个响应式的变量，用于存储当前选中的节点的key
const currentSelectedKey = ref('');
const codeText = ref();
const route = useRoute();
const loading = ref<boolean>(true);
onMounted(() => {
  getTreeData().then(() => {
    loading.value = false;
  });
});

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
// 定义一个响应式变量，用于控制是否是否显示保存按钮
const showSaveContentBtn = ref<boolean>(false);
const onSelect = (keys: any[], event: any) => {
  codeText.value = '';
  showSaveContentBtn.value = false;
  if (event.node.templateType === 10) return;
  showSaveContentBtn.value = true;
  currentSelectedKey.value = keys[0] ?? '';
  codeText.value = event.node.content || '';
  if (!keys[0]) return '';
};

async function getTreeData() {
  const { data = [] } = await postGeneratorPreViewCode({
    body: {
      templateId: route.query.templateId as string,
      projectId: route.query.projectId as string,
    },
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
</script>

<template>
  <Spin :spinning="loading" tip="loading...">
    <div class="m-4 grid min-h-[calc(100vh-120px)] grid-cols-12 gap-4">
      <div class="bg-card col-span-4 xl:col-span-3">
        <div class="bg-card flex items-center justify-between p-3">
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
        />
      </div>

      <div class="bg-card col-span-8 xl:col-span-9">
        <div class="bg-card">
          <Codemirror v-model:value="codeText" />
        </div>
      </div>
    </div>
  </Spin>
</template>

<style scoped></style>
