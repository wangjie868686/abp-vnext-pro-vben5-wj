<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { useVbenModal } from '@vben/common-ui';

import { Button, message, Modal, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import AddEditModal from './AddEditModal.vue';
import { getExampleTableApi } from './mock';

interface RowType {
  category: string;
  color: string;
  id: string;
  price: string;
  productName: string;
  releaseDate: string;
}

const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter category',
      },
      defaultValue: '1',
      fieldName: 'category',
      label: 'Category',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter productName',
      },
      fieldName: 'productName',
      label: 'ProductName',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter price',
      },
      fieldName: 'price',
      label: 'Price',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: 'Color1',
            value: '1',
          },
          {
            label: 'Color2',
            value: '2',
          },
        ],
        placeholder: '请选择',
      },
      fieldName: 'color',
      label: 'Color',
    },
    {
      component: 'DatePicker',
      fieldName: 'datePicker',
      label: 'Date',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  submitButtonOptions: {
    content: '查询',
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<RowType> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { align: 'left', title: 'Name', type: 'checkbox', width: 100 },
    { field: 'category', title: 'Category' },
    { field: 'color', title: 'Color' },
    { field: 'productName', title: 'Product Name' },
    { field: 'price', title: 'Price' },
    { field: 'releaseDate', formatter: 'formatDateTime', title: 'Date' },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 150,
    },
  ],
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        message.success(`Query params: ${JSON.stringify(formValues)}`);
        return await getExampleTableApi({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  toolbarConfig: {
    // 是否显示搜索表单控制按钮
    // @ts-ignore 正式环境时有完整的类型声明
    search: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

const [ActionModal, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: AddEditModal,
});

const handleAdd = () => {
  modalApi.setData({
    isEdit: false,
  });
  modalApi.open();
};

const handleExport = () => {
  message.success('export');
};

const handleEdit = (row: Record<string, any>) => {
  modalApi.setData({
    isEdit: true,
    row,
  });
  modalApi.open();
};

const handleDelete = (row: any) => {
  Modal.confirm({
    title: '确定删除吗？',
    onOk: () => {
      message.success(`delete: ${JSON.stringify(row)}`);
    },
  });
};
</script>

<template>
  <div class="vp-raw w-full">
    <Grid>
      <template #toolbar-actions>
        <Space>
          <Button type="primary" @click="handleAdd">
            {{ $t('common.add') }}
          </Button>
          <Button type="primary" @click="handleExport">
            {{ $t('common.export') }}
          </Button>
        </Space>
      </template>

      <template #action="{ row }">
        <Button type="link" @click="handleEdit(row)">编辑</Button>
        <Button danger type="link" @click="handleDelete(row)">删除</Button>
      </template>
    </Grid>

    <ActionModal @reload="gridApi.reload" />
  </div>
</template>
