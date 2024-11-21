<script setup lang="ts">
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

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
  <Page auto-content-height>
    <Grid>
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
  </Page>
</template>
<style scoped></style>
