<script setup lang="ts">
	import { Page } from '@vben/common-ui';
  import { useVbenVxeGrid } from '#/adapter/vxe-table.ts';
	import { postLanguagesPage } from '#/api-client'
	import type { VbenFormProps, VxeGridProps } from '#/adapter';
  import {languageQuerySchema,languageTableSchema } from './schema';
  import { h, ref } from 'vue';
  import {Tag} from 'ant-design-vue';
	defineOptions({
		name: 'Language',
	})

	const formOptions : VbenFormProps = {
		schema: languageQuerySchema
	};


	const gridOptions : VxeGridProps<any> = {
		columns: languageTableSchema,
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
					const { data } = await postLanguagesPage({
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
