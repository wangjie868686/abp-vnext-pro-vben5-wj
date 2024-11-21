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
  // { field: 'uiCultureName', title: 'UI语言名称	', minWidth: '150' },
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
    component: 'Input',
    fieldName: 'filter',
    label: $t('common.keyword'),
  },
];

export const languageTextTableSchema: any = [
  { title: $t('common.seq'), type: 'seq', width: 50 },
  { field: 'name', title: $t('abp.language.language'), minWidth: '150' },
  // { field: 'value', title: 'UI语言名称	', minWidth: '150' },
  {
    field: 'resourceName',
    title: $t('abp.language.resourceName'),
    minWidth: '150',
  },
];
