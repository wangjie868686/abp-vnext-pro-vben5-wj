<script setup lang="ts">
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';

import { Page } from '@vben/common-ui';

import { Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { postLanguageTextsPage } from '#/api-client';

import { languageTextQuerySchema, languageTextTableSchema } from './schema';

defineOptions({
  name: 'LanguageText',
});

const formOptions: VbenFormProps = {
  schema: languageTextQuerySchema,
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

const [Grid] = useVbenVxeGrid({ formOptions, gridOptions });
</script>

<template>
  <Page auto-content-height>
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
