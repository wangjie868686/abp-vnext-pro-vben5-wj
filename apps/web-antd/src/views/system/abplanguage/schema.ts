import { $t } from '@vben/locales';

export const languageQuerySchema: any = [
  {
    component: 'Input',
    fieldName: 'filter',
    label: $t('common.keyword'),
  },
];

export const languageTableSchema: any = [
  { title: $t('common.seq'), type: 'seq', width: 50 },
  { field: 'cultureName', title: $t('abp.language.language'), minWidth: '150' },
  {
    field: 'displayName',
    title: $t('abp.language.showLanguage'),
    minWidth: '150',
  },
  // { field: 'flagIcon', title: '图标', minWidth: '150' },
  {
    field: 'isEnabled',
    title: $t('common.isEnable'),
    minWidth: '150',
    slots: { default: 'isEnabled' },
  },
];

export const languageTextQuerySchema: any = [
  {
    component: 'VbenSelect',
    fieldName: 'cultureName',
    label: $t('abp.language.language'),
    defaultValue: 'zh-Hans',
    componentProps: {
      options: [
        {
          label: '简体中文',
          value: 'zh-Hans',
        },
        {
          label: 'en',
          value: 'en',
        },
      ],
    },
  },
  {
    component: 'VbenSelect',
    fieldName: 'resourceName',
    label: $t('abp.language.resourceName'),
    componentProps: {
      options: [],
    },
  },
  {
    component: 'Input',
    fieldName: 'filter',
    label: $t('common.keyword'),
  },
];

export const languageTextTableSchema: any = [
  { title: $t('common.seq'), type: 'seq', width: 50 },
  { field: 'name', title: $t('abp.language.name'), minWidth: '150' },
  { field: 'value', title: $t('abp.language.value'), minWidth: '150' },
  {
    field: 'resourceName',
    title: $t('abp.language.resourceName'),
    minWidth: '150',
  },
  {
    title: $t('common.action'),
    field: 'action',
    fixed: 'right',
    width: '150',
    slots: { default: 'action' },
  },
];

export const addFormSchema: any = [
  {
    component: 'VbenSelect',
    fieldName: 'cultureName',
    label: $t('abp.language.language'),
    defaultValue: 'zh-Hans',
    componentProps: {
      options: [
        {
          label: '简体中文',
          value: 'zh-Hans',
        },
        {
          label: 'en',
          value: 'en',
        },
      ],
    },
  },
  {
    component: 'VbenSelect',
    fieldName: 'resourceName',
    label: $t('abp.language.resourceName'),
    componentProps: {
      options: [],
    },
  },
  {
    fieldName: 'name',
    label: $t('abp.language.name'),
    component: 'Input',
    componentProps: {},
  },
  {
    fieldName: 'value',
    label: $t('abp.language.value'),
    component: 'Input',
    componentProps: {},
  },
];

export const editFormSchema: any = [
  {
    component: 'VbenSelect',
    fieldName: 'cultureName',
    label: $t('abp.language.language'),
    defaultValue: 'zh-Hans',
    componentProps: {
      disabled: true,
      options: [
        {
          label: '简体中文',
          value: 'zh-Hans',
        },
        {
          label: 'en',
          value: 'en',
        },
      ],
    },
  },
  {
    component: 'Input',
    fieldName: 'resourceName',
    label: $t('abp.language.resourceName'),
    componentProps: {
      disabled: true,
    },
  },
  {
    fieldName: 'name',
    label: $t('abp.language.name'),
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    fieldName: 'value',
    label: $t('abp.language.value'),
    component: 'Input',
    componentProps: {},
  },
];
