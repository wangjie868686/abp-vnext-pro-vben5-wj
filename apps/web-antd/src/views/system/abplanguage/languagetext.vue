<script setup lang="ts">
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, Space, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  postLanguageTextsAllResource,
  postLanguageTextsPage,
} from '#/api-client';

// 新增modal
import AddLanguageTextModal from './AddLanguageTextModal.vue';

// 编辑modal
import EditLanguageTextModal from './EditLanguageTextModal.vue';
import { languageTextQuerySchema, languageTextTableSchema } from './schema';

defineOptions({
  name: 'LanguageText',
});

const formOptions: VbenFormProps = {
  schema: languageTextQuerySchema,
  wrapperClass: 'grid-cols-4',
};

const gridOptions: VxeGridProps<any> = {
  columns: languageTextTableSchema,
  toolbarConfig: {
    custom: true,
  },
  customConfig: {
    storage: true,
  },
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        const { data } = await postLanguageTextsPage({
          body: {
            pageIndex: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          },
        });
        return data;
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

onMounted(async () => {
  const res = await postLanguageTextsAllResource();

  gridApi.formApi.updateSchema([
    {
      componentProps: {
        options: res?.data?.map((item) => ({
          label: item.label,
          value: item.value,
        })),
      },
      fieldName: 'resourceName',
    },
  ]);
});

const [AddVbenLanguageTextModal, addModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: AddLanguageTextModal,
});
const [EditVbenLanguageTextModal, editModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: EditLanguageTextModal,
});
const handleAdd = () => {
  addModalApi.open();
};

const handleEdit = async (row: Record<string, any>) => {
  const formValues = await gridApi.formApi.getValues();
  const cultureName = formValues.cultureName;
  const record = { ...row, cultureName };
  editModalApi.setData({
    row: record,
  });
  editModalApi.open();
};
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <Space>
          <Button
            type="primary"
            v-access:code="'AbpIdentity.LanguageTexts.Create'"
            @click="handleAdd"
          >
            {{ $t('common.add') }}
          </Button>
        </Space>
      </template>

      <template #action="{ row }">
        <Button
          type="primary"
          v-access:code="'AbpIdentity.LanguageTexts.Update'"
          @click="handleEdit(row)"
        >
          {{ $t('common.edit') }}
        </Button>
      </template>
      <template #isEnabled="{ row }">
        <component
          :is="
            h(
              Tag,
              { color: row.isEnabled ? 'green' : 'red' },
              row.isEnabled ? $t('common.enabled') : $t('common.disabled'),
            )
          "
        />
      </template>
    </Grid>
    <AddVbenLanguageTextModal @reload="gridApi.reload" />
    <EditVbenLanguageTextModal @reload="gridApi.reload" />
  </Page>
</template>
<style scoped></style>
