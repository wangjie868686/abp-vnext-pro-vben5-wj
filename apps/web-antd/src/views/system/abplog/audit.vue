<script setup lang="ts">
	import { Page } from '@vben/common-ui';
  import { useVbenVxeGrid } from '#/adapter/vxe-table.ts';
	import { postAuditLogsPage} from '#/api-client'
	import type { VbenFormProps, VxeGridProps } from '#/adapter';
  import {auditLogQuerySchema,auditLogTableSchema } from './schema';
	defineOptions({
		name: 'AbpAuditLog',
	})

	const formOptions : VbenFormProps = {
		schema: auditLogQuerySchema
	};


	const gridOptions : VxeGridProps<any> = {
		columns: auditLogTableSchema,
		toolbarConfig: {
			custom: true
		},
		customConfig: {
			storage: true
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
						}
					});
					return data;
				},
			},
		},
	};

	const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });


	
</script>

<style scoped></style>
<template>
	<Page auto-content-height title="审计日志">
		<Grid/>
	</Page>
</template>
