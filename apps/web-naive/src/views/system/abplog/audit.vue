<script setup lang="ts">
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconDocDetail } from '@vben/icons';
import { usePreferences } from '@vben/preferences';

import { NButton as Button } from 'naive-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { postAuditLogsPage } from '#/api-client';

import { auditLogQuerySchema, auditLogTableSchema } from './schema';

defineOptions({
  name: 'AbpAuditLog',
});

const { isDark } = usePreferences();
const formOptions: VbenFormProps = {
  schema: auditLogQuerySchema,
  wrapperClass: 'grid-cols-3',
};

const gridOptions: VxeGridProps<any> = {
  columns: auditLogTableSchema,
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
        const { data } = await postAuditLogsPage({
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

const jsonData = ref();
const [Drawer, drawerApi] = useVbenDrawer();
const viewDetail = (row: any) => {
  jsonData.value = row;
  drawerApi.open();
};
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #action="{ row }">
        <div class="flex items-center">
          <IconDocDetail style="color: var(--vxe-ui-font-primary-color)" />
          <Button class="pl-1" type="link" @click="viewDetail(row)">
            {{ $t('abp.log.detail') }}
          </Button>
        </div>
      </template>
    </Grid>
    <Drawer :title="$t('abp.log.detail')" class="w-[600px]">
      <JsonViewer
        :theme="isDark ? 'dark' : 'light'"
        :value="jsonData"
        class="h-full"
        copyable
        sort
      />
    </Drawer>
  </Page>
</template>
<style scoped></style>
