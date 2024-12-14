import { z } from '@vben/common-ui';

import dayjs from 'dayjs';

import { $t } from '#/locales';

export const querySchema: any = [
  {
    component: 'Input',
    fieldName: 'messageType',
    label: 'messageType',
    defaultValue: 10,
    dependencies: {
      show: () => false,
      triggerFields: ['messageType'],
    },
  },
  {
    component: 'Input',
    fieldName: 'title',
    label: $t('abp.message.title'),
  },
  {
    component: 'Input',
    fieldName: 'content',
    label: $t('abp.message.content'),
  },
  {
    component: 'Select',
    fieldName: 'messageLevel',
    label: $t('abp.message.level'),
    width: 120,
    componentProps: {
      options: [
        {
          label: $t('common.warning'),
          value: 10,
        },
        {
          label: $t('common.info'),
          value: 20,
        },
        {
          label: $t('common.error'),
          value: 30,
        },
      ],
    },
  },
];
export const tableSchema: any = [
  { title: $t('common.seq'), type: 'seq', width: 50 },
  { field: 'title', title: $t('abp.message.title'), minWidth: '150' },
  { field: 'content', title: $t('abp.message.content'), minWidth: '150' },
  {
    field: 'messageLevelName',
    title: $t('abp.message.level'),
    minWidth: '150',
    slots: { default: 'messageLevel' },
  },
  { field: 'senderUserName', title: $t('abp.message.sender'), minWidth: '150' },
  {
    field: 'creationTime',
    title: $t('common.createTime'),
    width: '150',
    formatter: ({ cellValue }) => {
      return dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss');
    },
  },
];

export const addFormSchema: any = [
  {
    component: 'Input',
    componentProps: {},
    fieldName: 'title',
    label: $t('abp.message.title'),
    rules: z
      .string()
      .min(1, { message: $t('common.pleaseInput') + $t('abp.message.title') }),
  },
  {
    component: 'Input',
    componentProps: {
      type: 'textarea',
    },
    fieldName: 'content',
    label: $t('abp.message.content'),
    rules: z.string().min(1, {
      message: $t('common.pleaseInput') + $t('abp.message.content'),
    }),
  },
  {
    component: 'Select',
    fieldName: 'messageLevel',
    label: $t('abp.message.level'),
    required: true,
    defaultValue: 20,
    componentProps: {
      options: [
        {
          label: $t('common.warning'),
          value: 10,
        },
        {
          label: $t('common.info'),
          value: 20,
        },
        {
          label: $t('common.error'),
          value: 30,
        },
      ],
    },
  },
];

export const addMessageFormSchema: any = [
  {
    component: 'Input',
    componentProps: {},
    fieldName: 'userName',
    label: $t('abp.message.sender'),
    rules: z.string().min(1, { message: '请输入接收人username' }),
  },
  {
    component: 'Input',
    fieldName: 'title',
    label: $t('abp.message.title'),
    rules: z.string().min(1, { message: '请输入标题' }),
  },
  {
    component: 'Input',
    componentProps: {
      type: 'textarea',
    },
    fieldName: 'content',
    label: $t('abp.message.content'),
    rules: z.string().min(1, { message: '请输入内容' }),
  },
  {
    component: 'Select',
    fieldName: 'messageLevel',
    label: $t('abp.message.level'),
    required: true,
    defaultValue: 20,
    componentProps: {
      options: [
        {
          label: $t('common.warning'),
          value: 10,
        },
        {
          label: $t('common.info'),
          value: 20,
        },
        {
          label: $t('common.error'),
          value: 30,
        },
      ],
    },
  },
];

export const tableMessageSchema: any = [
  { title: $t('common.seq'), type: 'seq', width: 50 },
  { field: 'title', title: $t('abp.message.title'), minWidth: '150' },
  { field: 'content', title: $t('abp.message.content'), minWidth: '150' },
  // { field: 'messageTypeName', title: '类型', minWidth: '150' },
  {
    field: 'messageLevelName',
    title: $t('abp.message.level'),
    minWidth: '150',
    slots: { default: 'messageLevel' },
  },
  {
    field: 'senderUserName',
    title: $t('abp.message.receiver'),
    minWidth: '150',
  },
  {
    field: 'receiveUserName',
    title: $t('abp.message.sender'),
    minWidth: '150',
  },
  {
    field: 'read',
    title: $t('abp.message.isRead'),
    minWidth: '150',
    slots: { default: 'read' },
  },
  {
    field: 'creationTime',
    title: $t('common.createTime'),
    minWidth: '150',
    formatter: ({ cellValue }) => {
      return dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  {
    title: $t('common.action'),
    field: 'action',
    fixed: 'right',
    width: '150',
    slots: { default: 'action' },
  },
];
export const queryMessageSchema: any = [
  {
    component: 'Input',
    fieldName: 'messageType',
    label: 'messageType',
    defaultValue: 20,
    dependencies: {
      show: () => false,
      triggerFields: ['messageType'],
    },
  },
  {
    component: 'Input',
    fieldName: 'title',
    label: $t('abp.message.title'),
  },
  {
    component: 'Input',
    fieldName: 'content',
    label: $t('abp.message.content'),
  },
  {
    component: 'Select',
    fieldName: 'messageLevel',
    label: $t('abp.message.level'),
    width: 120,
    componentProps: {
      options: [
        {
          label: $t('common.warning'),
          value: 10,
        },
        {
          label: $t('common.info'),
          value: 20,
        },
        {
          label: $t('common.error'),
          value: 30,
        },
      ],
    },
  },
  // {
  //   component: 'Select',
  //   fieldName: 'messageType',
  //   label: '类型',
  //   width: 120,
  //   componentProps: {
  //     options: [
  //       {
  //         label: '广播消息',
  //         value: 10,
  //       },
  //       {
  //         label: '普通文本消息',
  //         value: 20,
  //       },
  //     ],
  //   },
  // },
  {
    component: 'Select',
    fieldName: 'read',
    label: $t('abp.message.isRead'),
    componentProps: {
      options: [
        {
          label: $t('common.yes'),
          value: true,
        },
        {
          label: $t('common.no'),
          value: false,
        },
      ],
    },
  },
];
