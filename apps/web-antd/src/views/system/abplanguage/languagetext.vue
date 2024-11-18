<script setup lang="ts">
	import { Page } from '@vben/common-ui';
  import { useVbenVxeGrid } from '#/adapter/vxe-table.ts';
	import { postLanguageTextsPage } from '#/api-client'
	import type { VbenFormProps, VxeGridProps } from '#/adapter';
  import {languageTextQuerySchema,languageTextTableSchema } from './schema';
  import { h, ref } from 'vue';
  import {Tag} from 'ant-design-vue';
	defineOptions({
		name: 'LanguageText',
	})

	const formOptions : VbenFormProps = {
		schema: languageTextQuerySchema
	};


	const gridOptions : VxeGridProps<any> = {
		columns: languageTextTableSchema,
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
					const { data } = await postLanguageTextsPage({
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
