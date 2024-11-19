<script setup lang="ts">
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';

import { Page } from '@vben/common-ui';

import { Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { postLanguagesPage } from '#/api-client';

import { languageQuerySchema, languageTableSchema } from './schema';

defineOptions({
  name: 'Language',
});

const formOptions: VbenFormProps = {
  schema: languageQuerySchema,
};

const gridOptions: VxeGridProps<any> = {
  columns: languageTableSchema,
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
        const { data } = await postLanguagesPage({
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

const [Grid] = useVbenVxeGrid({ formOptions, gridOptions });
</script>

<template>
  <Page auto-content-height title="语言管理">
    <Grid>
      <template #isEnabled="{ row }">
        <component
          :is="
            h(
              Tag,
              { color: row.isEnabled ? 'green' : 'red' },
              row.isEnabled ? '启用' : '禁用',
            )
          "
        />
      </template>
    </Grid>
  </Page>
</template>
<style scoped></style>
