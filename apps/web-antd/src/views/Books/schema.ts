import { z } from '@vben/common-ui';

import dayjs from 'dayjs';

import { $t } from '#/locales';

export const querySchema = [
    {
        component: 'RangePicker',
        fieldName: 'time',
        label: '创建时间',
        componentProps: {
            'value-format': 'YYYY-MM-DD',
        },
        defaultValue: [
            // 最近7天
            dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
            dayjs().subtract(-1, 'day').format('YYYY-MM-DD'),
        ],
    },
];

export const tableSchema: any = [
{ title: $t('common.seq'), type: 'seq', width: 50 },
{
    title: '编号',
    minWidth: '150',
    field: 'no',
},
{
    title: '名称',
    minWidth: '150',
    field: 'name',
},
{
    title: '价格',
    minWidth: '150',
    field: 'price',
},
{
    title: '备注',
    minWidth: '150',
    field: 'remark',
},
{
    title: '类型',
    minWidth: '150',
    field: 'bookTypeDescription',
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
    fieldName: 'no', 
    label: '编号',
    rules: 'required',
    component: "Input",
},
{
    fieldName: 'name', 
    label: '名称',
    rules: 'required',
    component: "Input",
},
{
    fieldName: 'price', 
    label: '价格',
    rules: 'required',
    component: "Input",
},
{
    fieldName: 'remark', 
    label: '备注',
    component: "Input",
},
{
    fieldName: 'bookType', 
    label: '类型',
    rules: 'required',
    component: "Select",
    componentProps: {
    options: [
            { label: '历史', value: 10 },
            { label: '小说', value: 20 },
            { label: '其它', value: 30 },
        ],
    }
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
    fieldName: 'no',
    label: '编号',
    rules: 'required',
    component: "Input",
},
{
    fieldName: 'name',
    label: '名称',
    rules: 'required',
    component: "Input",
},
{
    fieldName: 'price',
    label: '价格',
    rules: 'required',
    component: "Input",
},
{
    fieldName: 'remark',
    label: '备注',
    component: "Input",
},
{
    fieldName: 'bookType',
    label: '类型',
    rules: 'required',
    component: "Select",
        componentProps: {
    options: [
    { label: '历史', value: 10 },
    { label: '小说', value: 20 },
    { label: '其它', value: 30 },
],
}
},
];
