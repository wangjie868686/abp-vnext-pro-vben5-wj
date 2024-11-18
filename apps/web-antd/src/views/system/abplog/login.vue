<script setup lang="ts">
	import { Page } from '@vben/common-ui';
  import { useVbenVxeGrid } from '#/adapter/vxe-table.ts';
	import { postIdentitySecurityLogsPage} from '#/api-client'
	import type { VbenFormProps, VxeGridProps } from '#/adapter';
  import {loginLogQuerySchema,logTableSchema } from './schema';
	defineOptions({
		name: 'AbpLoginLog',
	})

	const formOptions : VbenFormProps = {
		schema: loginLogQuerySchema
	};


	const gridOptions : VxeGridProps<any> = {
		columns: logTableSchema,
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
					const { data } = await postIdentitySecurityLogsPage({
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
	<Page auto-content-height title="登录日志">
		<Grid/>
	</Page>
</template>
