import dayjs from 'dayjs';

import { $t } from '#/locales';

export const logQuerySchema: any = [
  {
    component: 'RangePicker',
    fieldName: 'time',
    label: $t('abp.log.loginTime'),
    componentProps: {
      'value-format': 'YYYY-MM-DD',
    },
    defaultValue: [
      dayjs().subtract(0, 'day').format('YYYY-MM-DD'),
      dayjs().format('YYYY-MM-DD'),
    ],
  },
  {
    component: 'Input',
    fieldName: 'userName',
    label: $t('abp.log.userName'),
  },
  {
    component: 'Input',
    fieldName: 'correlationId',
    label: 'CorrelationId',
  },
];

export const logTableSchema: any = [
  { title: $t('common.seq'), type: 'seq', width: 50 },
  {
    field: 'applicationName',
    title: $t('abp.log.applicationName'),
    minWidth: '150',
  },
  { field: 'identity', title: $t('abp.log.loginMode'), minWidth: '150' },
  { field: 'action', title: $t('abp.log.loginUrl'), minWidth: '150' },
  { field: 'userName', title: $t('abp.log.userName'), minWidth: '150' },
  { field: 'correlationId', title: 'CorrelationId', minWidth: '150' },
  { field: 'clientIpAddress', title: $t('abp.log.clientIp'), minWidth: '150' },
  {
    field: 'creationTime',
    title: $t('common.createTime'),
    minWidth: '150',
    formatter: ({ cellValue }) => {
      return dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss');
    },
  },
];

export const auditLogQuerySchema: any = [
  {
    component: 'RangePicker',
    fieldName: 'time',
    label: $t('abp.log.executionTime'),
    componentProps: {
      'value-format': 'YYYY-MM-DD',
    },
    defaultValue: [
      dayjs().subtract(0, 'day').format('YYYY-MM-DD'),
      dayjs().format('YYYY-MM-DD'),
    ],
  },
  {
    component: 'Input',
    fieldName: 'userName',
    label: $t('abp.log.userName'),
  },
  {
    component: 'Input',
    fieldName: 'correlationId',
    label: 'CorrelationId',
  },
  {
    component: 'Input',
    fieldName: 'url',
    label: 'Url',
  },
];

export const auditLogTableSchema: any = [
  { title: $t('common.seq'), type: 'seq', width: 50 },
  { field: 'url', title: 'Url', minWidth: '150' },
  { field: 'tenantName', title: $t('abp.log.tenant'), minWidth: '150' },
  { field: 'userName', title: $t('abp.log.userName'), minWidth: '150' },
  {
    field: 'executionTime',
    title: $t('abp.log.executionTime'),
    minWidth: '150',
    formatter: ({ cellValue }) => {
      return dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  {
    field: 'executionDuration',
    title: $t('abp.log.responseTime'),
    minWidth: '150',
  },
  {
    field: 'clientIpAddress',
    title: $t('abp.log.clientIp'),
    minWidth: '150',
  },
  { field: 'correlationId', title: 'CorrelationId', minWidth: '150' },
  { field: 'exceptions', title: $t('abp.log.exception'), minWidth: '150' },
];
