export const languageQuerySchema: any = [
  {
    component: 'Input',
    fieldName: 'filter',
    label: '关键字',
  },
];

export const languageTableSchema: any = [
  { title: '序号', type: 'seq', width: 50 },
  { field: 'cultureName', title: '语言名称', minWidth: '150' },
  { field: 'uiCultureName', title: 'UI语言名称	', minWidth: '150' },
  { field: 'displayName', title: '显示名称', minWidth: '150' },
  { field: 'flagIcon', title: '图标', minWidth: '150' },
  {
    field: 'isEnabled',
    title: '是否启用',
    minWidth: '150',
    slots: { default: 'isEnabled' },
  },
];

export const languageTextQuerySchema: any = [
  {
    component: 'VbenSelect',
    fieldName: 'cultureName',
    label: '语言名称',
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
    label: '关键字',
  },
];

export const languageTextTableSchema: any = [
  { title: '序号', type: 'seq', width: 50 },
  { field: 'name', title: '语言名称', minWidth: '150' },
  { field: 'value', title: 'UI语言名称	', minWidth: '150' },
  { field: 'resourceName', title: '资源名称	', minWidth: '150' },
];
