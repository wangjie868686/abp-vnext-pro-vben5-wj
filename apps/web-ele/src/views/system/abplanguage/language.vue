<script setup lang="ts">
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElTag as Tag } from 'element-plus';

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
        <Tag v-if="row.isEnabled" type="success">
          {{ $t('common.enabled') }}
        </Tag>
        <Tag v-if="!row.isEnabled" type="primary">
          {{ $t('common.disabled') }}
        </Tag>
      </template>
    </Grid>
  </Page>
</template>
<style scoped></style>
