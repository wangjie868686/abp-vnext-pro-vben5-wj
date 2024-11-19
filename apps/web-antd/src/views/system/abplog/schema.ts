import dayjs from 'dayjs';

export const loginLogQuerySchema: any = [
  {
    component: 'RangePicker',
    fieldName: 'time',
    label: '登录时间',
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
    label: '用户名',
  },
  {
    component: 'Input',
    fieldName: 'correlationId',
    label: 'CorrelationId',
  },
];

export const logTableSchema: any = [
  { title: '序号', type: 'seq', width: 50 },
  { field: 'applicationName', title: '应用程序名称', minWidth: '150' },
  { field: 'identity', title: '登录方式', minWidth: '150' },
  { field: 'action', title: '登录地址', minWidth: '150' },
  { field: 'userName', title: '用户名', minWidth: '150' },
  { field: 'correlationId', title: 'CorrelationId', minWidth: '150' },
  { field: 'clientIpAddress', title: '客户端IP', minWidth: '150' },
  {
    field: 'creationTime',
    title: '创建时间',
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
    label: '登录时间',
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
    label: '用户名',
  },
  {
    component: 'Input',
    fieldName: 'correlationId',
    label: 'CorrelationId',
  },
];

export const auditLogTableSchema: any = [
  { title: '序号', type: 'seq', width: 50 },
  { field: 'url', title: 'Url', minWidth: '150' },
  { field: 'tenantName', title: '租户', minWidth: '150' },
  { field: 'userName', title: '用户名', minWidth: '150' },
  {
    field: 'executionTime',
    title: '执行时间',
    minWidth: '150',
    formatter: ({ cellValue }) => {
      return dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  { field: 'executionDuration', title: '响应时间(毫秒)	', minWidth: '150' },
  { field: 'clientIpAddress', title: '客户端IP', minWidth: '150' },
  { field: 'correlationId', title: 'CorrelationId', minWidth: '150' },
  { field: 'exceptions', title: '异常', minWidth: '150' },
];
