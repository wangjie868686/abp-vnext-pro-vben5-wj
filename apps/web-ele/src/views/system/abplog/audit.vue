<script setup lang="ts">
import { ref } from 'vue';
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import { Page, useVbenDrawer, } from '@vben/common-ui';
import { IconDocDetail } from '@vben/icons';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { postAuditLogsPage } from '#/api-client';
import { ElButton as Button } from 'element-plus';
import { auditLogQuerySchema, auditLogTableSchema } from './schema';
import { usePreferences } from '@vben/preferences';

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
        if (formValues?.time?.length === 2) {
          formValues = {
            ...formValues,
            startCreationTime: formValues.time[0],
            endCreationTime: formValues.time[1],
          };
          delete formValues.time;
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
  console.log(row);
  jsonData.value = row;
  drawerApi.open();
}

</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #action="{ row }">
        <div class="flex items-center">
          <IconDocDetail style="color: var(--el-color-primary);" />
          <Button link type="primary" @click="viewDetail(row)">详情</Button>
        </div>
      </template>
    </Grid>
    <Drawer class="w-[600px]" title="详情">
      <JsonViewer class="h-full" :value="jsonData" copyable sort :theme="isDark ? 'dark' : 'light'"/>
    </Drawer>
  </Page>
</template>
<style scoped></style>
