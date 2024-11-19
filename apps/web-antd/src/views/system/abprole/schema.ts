import { z } from '@vben/common-ui';

export const querySchema: any = [
  {
    component: 'Input',
    fieldName: 'filter',
    label: '角色名',
  },
];

export const tableSchema: any = [
  { title: '序号', type: 'seq', width: 50 },
  { field: 'name', title: '角色名称', minWidth: '150' },
  {
    field: 'isDefault',
    title: '是否默认',
    minWidth: '75',
    slots: { default: 'isDefault' },
  },
  {
    title: '操作',
    field: 'action',
    fixed: 'right',
    minWidth: '150',
    slots: { default: 'action' },
  },
];

export const addRoleFormSchema: any = [
  {
    component: 'Input',
    componentProps: {
      placeholder: '请输入角色名称',
    },
    fieldName: 'name',
    label: '角色名称',
    rules: z.string().min(1, { message: '请输入角色名称' }),
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: [
        {
          label: '是',
          value: 1,
        },
        {
          label: '否',
          value: 0,
        },
      ],
    },
    defaultValue: 0,
    fieldName: 'isDefault',
    label: '是否默认',
    rules: 'required',
  },
];
