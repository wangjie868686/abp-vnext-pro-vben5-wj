import { $t } from '#/locales';

export const querySchema = [
  // {
  //   component: 'RangePicker',
  //   fieldName: 'time',
  //   label: $t('common.createTime'),
  //   componentProps: {
  //     'value-format': 'YYYY-MM-DD',
  //   },
  //   defaultValue: [
  //     // 最近7天
  //     dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
  //     dayjs().subtract(-1, 'day').format('YYYY-MM-DD'),
  //   ],
  // },
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('textTemplate.name'),
  },
  {
    component: 'Input',
    fieldName: 'code',
    label: $t('textTemplate.code'),
  },
  {
    component: 'Input',
    fieldName: 'content',
    label: $t('textTemplate.content'),
  },
];

export const tableSchema: any = [
  { title: $t('common.seq'), type: 'seq', width: 50 },
  {
    title: $t('textTemplate.name'),
    minWidth: '150',
    field: 'name',
  },
  {
    title: $t('textTemplate.code'),
    minWidth: '150',
    field: 'code',
  },
  {
    title: $t('textTemplate.content'),
    minWidth: '150',
    field: 'content',
  },
  {
    title: $t('textTemplate.cultureName'),
    minWidth: '150',
    field: 'cultureName',
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
    fieldName: 'name',
    label: $t('textTemplate.name'),
    rules: 'required',
    component: 'Input',
  },
  {
    fieldName: 'code',
    label: $t('textTemplate.code'),
    rules: 'required',
    component: 'Input',
  },
  {
    fieldName: 'content',
    label: $t('textTemplate.content'),
    rules: 'required',
    component: 'Textarea',
  },
  {
    fieldName: 'cultureName',
    label: $t('textTemplate.cultureName'),
    rules: 'required',
    component: 'Select',
    componentProps: {
      options: [
        {
          label: 'en',
          value: 'en',
        },
        {
          label: '简体中文',
          value: 'zh-Hans',
        },
      ],
    },
  },
];

export const editFormSchema: any = [
  {
    component: 'Input',
    componentProps: {},
    fieldName: 'id',
    label: 'id',
    dependencies: {
      show: () => false,
      triggerFields: ['id'],
    },
  },
  {
    fieldName: 'name',
    label: $t('textTemplate.name'),
    rules: 'required',
    component: 'Input',
  },
  {
    fieldName: 'code',
    label: $t('textTemplate.code'),
    rules: 'required',
    component: 'Input',
  },
  {
    fieldName: 'content',
    label: $t('textTemplate.content'),
    rules: 'required',
    component: 'Textarea',
  },
  {
    fieldName: 'cultureName',
    label: $t('textTemplate.cultureName'),
    rules: 'required',
    component: 'Select',
    componentProps: {
      options: [
        {
          label: 'en',
          value: 'en',
        },
        {
          label: '简体中文',
          value: 'zh-Hans',
        },
      ],
    },
  },
];
