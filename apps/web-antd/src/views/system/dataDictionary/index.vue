<template>
  <Page>
    <Row :gutter="16">
      <Col :span="8">
      <Grid>
        <template #toolbar-actions>
          <Button type="primary" @click="openDataDictionaryModal">新增</Button>
        </template>

        <template #codeName="{ row }">
          <div>{{ row.code + '|' + row.displayText }}</div>
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
                  <Button type="link" size="small" @click="editDataDictionary(row)">编辑</Button>
                  </MenuItem>
                  <MenuItem @click="">
                  <Button type="link" danger size="small" @click="deleteDataDictionary(row)">删除</Button>
                  </MenuItem>
                </Menu>
              </template>
            </Dropdown>
          </Space>
        </template>
      </Grid>
      </Col>
      <Col :span="16">
      <GridTable>
        <template #toolbar-actions>
          <Button type="primary" :disabled="!current.row" @click="openDataDictionaryDetailModal">新增</Button>
        </template>

        <template #isEnabled="{ row }">
          <Switch v-model:checked="row.isEnabled" @change="handleItemStausChange($event, row)" />
        </template>

        <template #action="{ row }">
          <Space>
            <Button type="link" @click="editDetailRow(row)">编辑</Button>
            <Button type="link" @click="removeDetailRow(row)">删除</Button>
          </Space>
        </template>
      </GridTable>
      </Col>
    </Row>
    <DataDictionaryModalComponent @reload="gridApi.reload" />
    <DataDictionaryDetailComponent @reload="gridTableApi.reload" />
  </Page>
</template>

<script setup lang="ts">
import { Row, Col, Space, Button, Dropdown, Menu, MenuItem, Modal, Switch, message } from 'ant-design-vue';
import { Page, type VbenFormProps } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  postDataDictionaryPage, postDataDictionaryDeleteDataDictionaryType, postDataDictionaryPageDetail,
  postDataDictionaryStatus,
  postDataDictionaryDelete,
} from '#/api-client/index';
import { useVbenModal, } from '@vben/common-ui';
import DataDictionaryModal from './DataDictionaryModal.vue';
import DataDictionaryDetail from './DataDictionaryDetailModal.vue';
import { ref } from 'vue';

defineOptions({
  name: 'DataDictionary',
})

/**  ============左侧表格相关逻辑 start ============== */
const formOptions: VbenFormProps = {
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

const gridOptions: VxeGridProps<any> = {
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
        const { data } = await postDataDictionaryPage({
          body: {
            pageIndex: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          }
        });
        return data;
      },
    },
  },
};

const gridEvents = {
  radioChange: handleDataDictionaryItemChange,
}
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions, formOptions, gridEvents });

const [DataDictionaryModalComponent, dataDictionaryModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: DataDictionaryModal,
});

const openDataDictionaryModal = () => {
  dataDictionaryModalApi.setData({
    isEdit: false,
  });
  dataDictionaryModalApi.open();
};

const editDataDictionary = (row: Record<string, any>) => {
  dataDictionaryModalApi.setData({
    isEdit: true,
    row,
  });
  dataDictionaryModalApi.open();
};

const deleteDataDictionary = async (row: Record<string, any>) => {
  Modal.confirm({
    title: '提示',
    content: '确认删除吗？',
    async onOk() {
      await postDataDictionaryDeleteDataDictionaryType({
        body: { id: row.id }
      });
      message.success('删除成功')
      gridApi.reload();
    },
  });

}

const current = ref<Record<string, any>>({});
async function handleDataDictionaryItemChange(item: Record<string, any>) {
  current.value = item;
  console.log({
    dataDictionaryId: current.value?.row?.id,
  })
  gridTableApi.reload({
    dataDictionaryId: 'current.value?.row?.id',
  });
};

/**  ============>左侧表格相关逻辑 end ============== */



/** ============>右侧表格相关逻辑 start ============== */
const rightFormOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      fieldName: 'filter',
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

const rightGridOptions: VxeGridProps<any> = {
  columns: [
    { field: 'code', title: '编码', minWidth: '75', },
    { field: 'displayText', title: '名称', minWidth: '150', },
    { field: 'order', title: '排序', minWidth: '150', },
    { field: 'isEnabled', title: '状态', minWidth: '150', slots: { default: 'isEnabled' }, },
    { field: 'description', title: '描述', minWidth: '150', },
    {
      title: '操作',
      field: 'action',
      fixed: 'right',
      width: '180',
      slots: { default: 'action' },
    },
  ],
  toolbarConfig: {
    custom: true
  },
  customConfig: {
    storage: true
  },
  minHeight: '500',
  keepSource: true,
  proxyConfig: {
    response: {
      total: 'totalCount'
    },
    ajax: {
      query: async ({ page }, formValues ) => {
        const { data } = await postDataDictionaryPageDetail({
          body: {
            pageIndex: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
            dataDictionaryId: current.value?.row?.id,
          }
        });
        return data;
      },
    },
  },
};

const [GridTable, gridTableApi] = useVbenVxeGrid({ gridOptions: rightGridOptions, formOptions: rightFormOptions });

const handleItemStausChange = async (enabled: any, row: Record<string, any>) => {
  await postDataDictionaryStatus({
    body: {
      dataDictionaryId: current.value?.row?.id,
      dataDictionayDetailId: row.id,
      isEnabled: enabled,
    }
  });
};

const [DataDictionaryDetailComponent, dataDictionaryDetailModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: DataDictionaryDetail,
});

const openDataDictionaryDetailModal = () => {
  dataDictionaryDetailModalApi.setData({
    isEdit: false,
    type: current.value?.row?.displayText,
    id: current.value?.row?.id,
  });
  dataDictionaryDetailModalApi.open();
};

const editDetailRow = (row: Record<string, any>) => {
  dataDictionaryDetailModalApi.setData({
    isEdit: true,
    type: current.value?.row?.displayText,
    id: current.value?.row?.id,
    row,
  });
  dataDictionaryDetailModalApi.open();
};

const removeDetailRow = async (row: Record<string, any>) => {
  Modal.confirm({
    title: '提示',
    content: '确认删除吗？',
    async onOk() {
      await postDataDictionaryDelete({
        body: { dataDictionaryId: current.value?.row?.id, dataDictionayDetailId: row.id  }
      });
      message.success('删除成功')
      gridTableApi.reload();
    },
  });
};

/** ============>右侧表格相关逻辑 end ============== */
</script>

<style scoped></style>
