<template>
    <Page :autoContentHeight="true">
      <Row>
        <Col :span="6">
          <div class="flex justify-between items-center bg-card p-3">
            <span class="text-lg">组织机构</span>
            <Button class="mx-3" type="primary" size="small">新增根机构</Button>
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
          <Tree class="mt-3"
          :expanded-keys="expandedKeys"
          :auto-expand-parent="autoExpandParent"
            :tree-data="gData"
            @expand="onExpand"
          >
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
        <Col :span="18">
          right
        </Col>
      </Row>
    </Page>
</template>

<script setup lang="ts">
import { Row, Col, Space, Button, Dropdown, Menu, Input, Modal, Tree,  } from 'ant-design-vue';
import { Page, useVbenModal, type VbenFormProps } from '@vben/common-ui';
import type { TreeProps } from 'ant-design-vue';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  postOrganizationUnitsTree, type TreeOutput,
} from '#/api-client/index';
import { onMounted, ref, watch } from 'vue';


// const { isDark } = usePreferences();
const selectedKeys = ref([]);
const expandedKeys = ref<(string | number)[]>([]);
const searchValue = ref<string>('');
const autoExpandParent = ref<boolean>(true);
const gData = ref<Array<TreeOutput>>([]);

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
</script>

<style scoped>

</style>
