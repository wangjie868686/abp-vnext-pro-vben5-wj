import { z } from '@vben/common-ui';
import dayjs from 'dayjs';

export const languageQuerySchema = [
  {
    component: 'Input',
    fieldName: 'filter',
    label: '关键字',
  }
];

export const languageTableSchema =[
  { title: '序号', type: 'seq', width: 50 },
  { field: 'cultureName', title: '语言名称', minWidth: '150', },
  { field: 'uiCultureName', title: 'UI语言名称	', minWidth: '150', },
  { field: 'displayName', title: '显示名称', minWidth: '150', },
  { field: 'flagIcon', title: '图标', minWidth: '150', },
  { field: 'isEnabled', title: '是否启用', minWidth: '150',  slots: { default: 'isEnabled' } }
];


export const languageTextQuerySchema = [
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
          label: '英文',
          value: 'en',
        }
      ],
    },
  },
  {
    component: 'Input',
    fieldName: 'filter',
    label: '关键字',
  }
];

export const languageTextTableSchema =[
  { title: '序号', type: 'seq', width: 50 },
  { field: 'name', title: '语言名称', minWidth: '150', },
  { field: 'value', title: 'UI语言名称	', minWidth: '150', },
  { field: 'resourceName', title: '资源名称	', minWidth: '150', },
];
