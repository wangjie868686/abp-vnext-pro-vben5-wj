<script setup lang="ts">
	import { Page } from '@vben/common-ui';
	import { message as Message, Space, Tag, Button, Modal, Tree, Dropdown, Menu, MenuItem } from 'ant-design-vue';
  import { useVbenForm } from '#/adapter/form.ts';
  import { useVbenVxeGrid } from '#/adapter/vxe-table.ts';
	import { postPermissionsTree, postPermissionsUpdate, postRolesCreate, postRolesDelete, postRolesPage, postRolesUpdate, type PermissionTreeDto, } from '#/api-client'
	import { ref, h } from 'vue';
	import { useVbenModal, useVbenDrawer } from '@vben/common-ui';
	import type { VbenFormProps, VxeGridProps } from '#/adapter';
  import {querySchema,tableSchema, addRoleFormSchema } from './schema';
	defineOptions({
		name: 'AbpRole',
	})

	const formOptions : VbenFormProps = {
		schema: querySchema
	};


	const gridOptions : VxeGridProps<any> = {
		checkboxConfig: {
			highlight: true,
			labelField: 'name',
		},
		columns: tableSchema,
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
			response: {
				total: 'totalCount'
			},
			ajax: {
				query: async ({ page }, formValues) => {
					const { data } = await postRolesPage({
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

	const editRow : Record<string, any> = ref({});
	const [AddModal, addModalApi] = useVbenModal({
		draggable: true,
		onConfirm: submit,
		onBeforeClose: () => {
			editRow.value = {}
		}
	});

	const [AddRoleForm, addRoleFormApi] = useVbenForm({
		// 默认展开
		collapsed: false,
		// 所有表单项共用，可单独在表单内覆盖
		commonConfig: {
			// 所有表单项
			componentProps: {
				class: 'w-4/5',
			},
		},
		// 提交函数
		handleSubmit: () => gridApi.reload(),
		layout: 'horizontal',
		schema: addRoleFormSchema,
		showCollapseButton: false,
		showDefaultActions: false,
		wrapperClass: 'grid-cols-1',
	});

	async function submit() {
		// 表单校验
		const { valid } = await addRoleFormApi.validate();
		if (!valid) return;
		const formValues = await addRoleFormApi.getValues();
		// 获取调用的api和请求参数
		const api = editRow.value.id ? postRolesUpdate : postRolesCreate;
		const fetchParams : any = editRow.value.id ? {
			roleInfo: {
				...formValues,
				isDefault: Boolean(formValues.isDefault),
			},
			roleId: editRow.value.id
		} : {
			name: formValues.name,
			isDefault: !!formValues.isDefault
		};

		try {
			addModalApi.setState({ loading: true, confirmLoading: true })
			const { data = {} } = await api({ body: fetchParams });
			if (data.id) {
				Message.success(editRow.value.id ? '修改成功' : '新增成功');
				addModalApi.close();
				gridApi.reload();
			}
		} finally {
			addModalApi.setState({ loading: false, confirmLoading: false })
		}
	}

	function onEdit(record : any) {
		editRow.value = record;
		addModalApi.open();
		addRoleFormApi.setValues({ ...record, isDefault: record.isDefault ? 1 : 0 })
	}

	function onDel(row : any) {
		Modal.confirm({
			title: `确认删除 ${row.name} 吗？`,
			onOk: async () => {
				console.log('OK');
				await postRolesDelete({ body: { id: row.id } });
				gridApi.reload();
				Message.success('删除成功')
			},
		});
	}


	const authTree = ref([] as any)
	const authPolicy = ref([] as any)
	const defaultCheckedKeys = ref([] as any)

	const onAuth = async (row : any) => {
		editRow.value = row;
		authDrawerApi.open();
		try {
			authDrawerApi.setState({ loading: true })
			const { data = {} } = await postPermissionsTree({ body: { providerKey: row.name, providerName: 'R' } });
			authTree.value = data?.permissions || [];
			authPolicy.value = data?.allGrants || [];
			defaultCheckedKeys.value = data.grants || [];
		} finally {
			authDrawerApi.setState({ loading: false })
		}
	}

	const [AuthDrawer, authDrawerApi] = useVbenDrawer({
		onConfirm: () => {
			updateAuth()
		},
		onBeforeClose: () => {
			editRow.value = {}
		}
	});
	
	// 自定义级联选中
    const handleCheck = (checkedKeys, e) => {
      if (e.checked === true) {
        // 新增权限时，向下级联选中
        var filteredKeys = authTree.value.filter(key => key.startsWith(e.node.key));
        checkedKeys.checked = checkedKeys.checked.concat(filteredKeys.filter(key => checkedKeys.checked.indexOf(key) === -1));
      } else {
        // 取消权限时，向下级联反选
        checkedKeys.checked = checkedKeys.checked.filter(key => !key.startsWith(e.node.key));
      }
    }
	
	const updateAuth = async () => {
		try {
			authDrawerApi.setState({ loading: true, confirmLoading: true })
			let permissions = [] as any;
			defaultCheckedKeys.value.checked.forEach((item : any) => {
				if (item.toString().includes('.')) {
					permissions.push({
						name: item,
						isGranted: true
					});
				}

			})
			authPolicy.value.forEach((item : string | string[]) => {
				if (!permissions.find((x : { name : string | string[]; }) => x.name === item)) {
					if (item.includes('.')) {
						permissions.push({
							name: item,
							isGranted: false
						});
					}
				}
			});
			const resp = await postPermissionsUpdate({
				body: {
					providerKey: editRow.value.name, providerName: 'R',
					updatePermissionsDto: {
						permissions: permissions
					}
				}
			});
			if (resp.status === 200 || resp.status === 204) {
				Message.success('授权成功');
				authDrawerApi.close();
			}
		}
		finally {
			authDrawerApi.setState({ loading: false, confirmLoading: false })
		}

	}
</script>

<style scoped></style>
<template>
	<Page auto-content-height title="角色管理">
		<Grid>
			<template #toolbar-actions>
				<Space>
					<Button type="primary" @click="addModalApi.open"
						v-access:code="'AbpIdentity.Roles.Create'">新增</Button>
				</Space>
			</template>

			<template #isDefault="{ row }">
				<component :is="h(Tag, { color: row.isDefault ? 'green' : 'red' }, row.isDefault ? '是' : '否')">
				</component>
			</template>


			<template #action="{ row }">
				<Space>
					<Button type="primary" size="small" @click="onEdit(row)" v-access:code="'AbpIdentity.Roles.Update'">
						编辑
					</Button>
					<Dropdown>
						<Button size="small">
							更多操作
						</Button>
						<template #overlay>
							<Menu>
								<MenuItem @click="onAuth(row)">
								<Button type="link" size="small"
									v-access:code="'AbpIdentity.Roles.ManagePermissions'">授权</Button>
								</MenuItem>
								<MenuItem @click="onDel(row)">
								<Button type="link" danger size="small"
									v-access:code="'AbpIdentity.Roles.Delete'">删除</Button>
								</MenuItem>
							</Menu>
						</template>
					</Dropdown>
				</Space>
			</template>
		</Grid>

		<AddModal class="w-[600px]" :title="editRow.id ? '编辑角色' : '新增角色'">
			<AddRoleForm></AddRoleForm>
		</AddModal>
		<AuthDrawer class="w-[500px]" title="授权">
			<Tree v-model:checkedKeys="defaultCheckedKeys"  checkable :tree-data="authTree" @check="handleCheck" :checkStrictly="true" >
			</Tree>
		</AuthDrawer>
	</Page>
</template>
