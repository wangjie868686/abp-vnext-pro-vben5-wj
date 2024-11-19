import { z } from '@vben/common-ui';

export const querySchema: any = [
  {
    component: 'Input',
    fieldName: 'filter',
    label: '租户名称',
  },
];

export const tableSchema: any = [
  { title: '序号', type: 'seq', width: 50 },
  { field: 'name', title: '租户名称', minWidth: '150' },
  {
    title: '操作',
    field: 'action',
    fixed: 'right',
    minWidth: '150',
    slots: { default: 'action' },
  },
];

export const addTenantFormSchema: any = [
  {
    component: 'Input',
    componentProps: {},
    fieldName: 'name',
    label: '租户名称',
    rules: z.string().min(1, { message: '请输入租户名称' }),
  },
  {
    component: 'Input',
    componentProps: {},
    fieldName: 'adminEmailAddress',
    label: '管理员邮箱',
    rules: z.string().min(1, { message: '请输入管理员邮箱' }),
  },
  {
    component: 'Input',
    componentProps: {},
    fieldName: 'adminPassword',
    label: '管理员密码',
    rules: z.string().min(1, { message: '请输入管理员密码' }),
  },
];

export const editTenantFormSchemaEdit: any = [
  {
    component: 'Input',
    fieldName: 'id',
    label: 'id',
    dependencies: {
      show: () => false,
      triggerFields: ['id'],
    },
  },
  {
    component: 'Input',
    componentProps: {},
    fieldName: 'name',
    label: '租户名称',
    rules: z.string().min(1, { message: '请输入租户名称' }),
  },
];
