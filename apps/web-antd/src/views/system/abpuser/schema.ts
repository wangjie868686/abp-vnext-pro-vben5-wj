
import { z } from '@vben/common-ui';
import dayjs from 'dayjs';

export const querySchema = [
  {
    component: 'Input',
    fieldName: 'filter',
    label: '用户名',
  },
];

export const tableSchema =[
  { title: '序号', type: 'seq', width: 50 },
  { field: 'userName', title: '用户名', minWidth: '150' },
  { field: 'name', title: '真实名称', minWidth: '150' },
  { field: 'email', title: '邮箱', minWidth: '150' },
  { field: 'isActive', title: '状态', minWidth: '150' , slots: { default: 'isActive' }},
  { field: 'phoneNumber', title: '手机号码', minWidth: '150' },
  {
    field: 'creationTime',
    title: '创建时间',
    minWidth: '150',
    formatter: ({ cellValue }) => {
      return dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  {
    title: '操作',
    field: 'action',
    fixed: 'right',
    minWidth: '150',
    slots: { default: 'action' },
  },
]

export const addUserFormSchema = [
  {
    component: 'Input',
    componentProps: {},
    fieldName: 'userName',
    label: '用户名',
    rules: z.string().min(1, { message: '请输入用户名' }),
  },
  {
    component: 'Input',
    componentProps: {
    },
    fieldName: 'name',
    label: '名称',
    rules: z.string().min(1, { message: '请输入名称' }),
  },
  {
    component: 'Input',
    componentProps: {
    },
    fieldName: 'email',
    label: '邮箱',
    rules: z.string().email('请输入正确的邮箱'),
  },
  {
    component: 'Input',
    componentProps: {
    },
    fieldName: 'phoneNumber',
    label: '手机号码',
    rules: z.string().min(3, { message: '请输入手机号码' }),
  },
  {
    component: 'Input',
    componentProps: {
    },
    fieldName: 'password',
    label: '密码',
    rules: z.string().min(1, { message: '请输入密码' }),
  },
  {
    component: 'Input',
    componentProps: {
    },
    fieldName: 'confirmPassword',
    label: '密码(再次确认)',
    rules: 'required',
  },
]



export const editUserFormSchemaEdit = [
  {
    component: 'Input',
    componentProps: {},
    fieldName: 'userName',
    label: '用户名',
    rules: z.string().min(1, { message: '请输入用户名' }),
  },
  {
    component: 'Input',
    componentProps: {
    },
    fieldName: 'name',
    label: '名称',
    rules: z.string().min(1, { message: '请输入名称' }),
  },
  {
    component: 'Input',
    componentProps: {
    },
    fieldName: 'email',
    label: '邮箱',
    rules: z.string().email('请输入正确的邮箱'),
  },
  {
    component: 'Input',
    componentProps: {
    },
    fieldName: 'phoneNumber',
    label: '手机号码',
  },
  {
    component: 'Input',
    componentProps: {
    },
    fieldName: 'password',
    label: '密码',
  },
  {
    component: 'Input',
    componentProps: {
    },
    fieldName: 'confirmPassword',
    label: '密码(再次确认)',
  },
]
