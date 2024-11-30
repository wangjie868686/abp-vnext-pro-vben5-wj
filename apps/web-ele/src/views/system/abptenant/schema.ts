import { z } from '@vben/common-ui';

import { $t } from '#/locales';

export const querySchema: any = [
  {
    component: 'Input',
    fieldName: 'filter',
    label: $t('abp.tenant.name'),
  },
];

export const tableSchema: any = [
  { title: $t('common.seq'), type: 'seq', width: 50 },
  { field: 'name', title: $t('abp.tenant.name'), minWidth: '150' },
  {
    title: $t('common.action'),
    field: 'action',
    fixed: 'right',
    width: '300',
    slots: { default: 'action' },
  },
];

export const addTenantFormSchema: any = [
  {
    component: 'Input',
    componentProps: {},
    fieldName: 'name',
    label: $t('abp.tenant.name'),
    rules: z
      .string()
      .min(1, { message: $t('common.pleaseInput') + $t('abp.tenant.name') }),
  },
  {
    component: 'Input',
    componentProps: {},
    fieldName: 'adminEmailAddress',
    label: $t('abp.tenant.adminEmail'),
    rules: z.string().min(1, {
      message: $t('common.pleaseInput') + $t('abp.tenant.adminEmail'),
    }),
  },
  {
    component: 'Input',
    componentProps: {},
    fieldName: 'adminPassword',
    label: $t('abp.tenant.adminPassword'),
    rules: z.string().min(1, {
      message: $t('common.pleaseInput') + $t('abp.tenant.adminPassword'),
    }),
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
    label: $t('abp.tenant.name'),
    rules: z
      .string()
      .min(1, { message: $t('common.pleaseInput') + $t('abp.tenant.name') }),
  },
];
