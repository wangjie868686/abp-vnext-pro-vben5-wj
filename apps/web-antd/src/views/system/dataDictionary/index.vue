<template>
  <Page >
    <a-row :gutter="16">
      <a-col :span="8">

        <div class="px-2 py-5 mb-3 bg-white">
          <div class="flex justify-between items-center">
            <a-input v-model:value="filter" placeholder="请输入" @pressEnter="search" allowClear />
            <a-button class="ml-3" type="primary" @click="search">查询</a-button>
          </div>
        </div>

        <Grid>
          <template #toolbar-actions>
            <Button type="primary" @click="">新增</Button>
          </template>

          <template #codeName="{row}">
           <div>{{row.code + '|' + row.displayText}}</div>
          </template>

          <template #action="{ row }">
            <Space>
              <Dropdown>
                <Button size="small">
                  ...
                </Button>
                <template #overlay>
                  <Menu>
                    <MenuItem @click="">
                    <Button type="link" size="small">编辑</Button>
                    </MenuItem>
                    <MenuItem @click="">
                    <Button type="link" danger size="small" v-access:code="'AbpIdentity.Roles.Delete'">删除</Button>
                    </MenuItem>
                  </Menu>
                </template>
              </Dropdown>
            </Space>
          </template>
        </Grid>
      </a-col>
      <a-col :span="16">
        <GridTable>
          <template #toolbar-actions>
            <Button type="primary" @click="">新增</Button>
          </template>
        </GridTable>
      </a-col>
    </a-row>
  </Page>
</template>

<script setup lang="ts">
import { Space, Button, Dropdown, Menu, MenuItem, Input } from 'ant-design-vue';
import { Page, type VbenFormProps } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form.ts';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { postDataDictionaryPage } from '#/api-client/index';
import { ref, watch } from 'vue';

defineOptions({
  name: 'DataDictionary',
})



const filter = ref('');
watch(() => filter.value, (val) => {
  if (val === '') {
    search();
  }
})


const gridOptions: VxeGridProps<any> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { type: 'radio', width: '50', },
    { field: 'codeName', title: '编码|名称', minWidth: '75', slots: { default: 'codeName' }, },
    {
      title: '操作',
      field: 'action',
      fixed: 'right',
      width: '70',
      slots: { default: 'action' },
    },
  ],
  // toolbarConfig: {
  //   custom: true
  // },
  // customConfig: {
  //   storage: true
  // },
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
        const { data } = await postDataDictionaryPage({
          body: {
            pageIndex: page.currentPage,
            pageSize: page.pageSize,
            filter: filter.value,
          }
        });
        return data;
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });


const search = () => {
  gridApi.query({ filter: filter.value })
}


const rightFormOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      fieldName: 'filter',
      label: '',
    }],
    wrapperClass: 'grid-cols-2',
    showDefaultActions: true,
    submitOnEnter: true,
    showCollapseButton: false,
    commonConfig: {
      hideLabel: true,
    }
};

const rightGridOptions: VxeGridProps<any> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    // { type: 'radio', width: '50', },
    { field: 'codeName', title: '编码|名称', minWidth: '75', slots: { default: 'codeName' }, },
    { field: 'name', title: '名称', minWidth: '150',},
    { field: 'name', title: '名称', minWidth: '150',},
    { field: 'name', title: '名称', minWidth: '150',},
    { field: 'name', title: '名称', minWidth: '150',},
    {
      title: '操作',
      field: 'action',
      fixed: 'right',
      width: '70',
      slots: { default: 'action' },
    },
  ],
  toolbarConfig: {
    custom: true
  },
  customConfig: {
    storage: true
  },
  // minHeight: '500',
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
        const { data } = await postDataDictionaryPage({
          body: {
            pageIndex: page.currentPage,
            pageSize: page.pageSize,
            filter: filter.value,
          }
        });
        return data;
      },
    },
  },
};

const [GridTable, gridTableApi] = useVbenVxeGrid({ gridOptions: rightGridOptions, formOptions: rightFormOptions });
</script>

<style scoped></style>
