<script setup lang="ts">
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { postIdentitySecurityLogsPage } from '#/api-client';

import { loginLogQuerySchema, logTableSchema } from './schema';

defineOptions({
  name: 'AbpLoginLog',
});

const formOptions: VbenFormProps = {
  schema: loginLogQuerySchema,
  wrapperClass: 'grid-cols-4',
};

const gridOptions: VxeGridProps<any> = {
  columns: logTableSchema,
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
        if (formValues?.time?.length === 2) {
          formValues = {
            ...formValues,
            startCreationTime: formValues.time[0],
            endCreationTime: formValues.time[1],
          };
        }
        const { data } = await postIdentitySecurityLogsPage({
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
  <Page auto-content-height title="登录日志">
    <Grid />
  </Page>
</template>
<style scoped></style>
