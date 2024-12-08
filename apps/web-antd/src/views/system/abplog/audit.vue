<script setup lang="ts">
import { ref } from 'vue';
import { Button } from 'ant-design-vue';
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { postAuditLogsPage } from '#/api-client';
import { usePreferences } from '@vben/preferences';
import { auditLogQuerySchema, auditLogTableSchema } from './schema';
import { IconDocDetail } from '@vben/icons';

defineOptions({
  name: 'AbpAuditLog',
});

const { isDark } = usePreferences();
const formOptions: VbenFormProps = {
  schema: auditLogQuerySchema,
  wrapperClass: 'grid-cols-5',
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
        if (formValues?.time?.length == 2) {
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
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #action="{ row }">
        <div class="flex items-center">
          <IconDocDetail style="color: var(--vxe-ui-font-primary-color)" />
          <Button type="link" class="pl-1" @click="viewDetail(row)">详情</Button>
        </div>
      </template>9
    </Grid>
    <Drawer class="w-[600px]" title="详情">
      <JsonViewer class="h-full" :value="jsonData" copyable sort line-numbers :theme="isDark ? 'dark' : 'light'" />
    </Drawer>
  </Page>
</template>
<style scoped></style>
