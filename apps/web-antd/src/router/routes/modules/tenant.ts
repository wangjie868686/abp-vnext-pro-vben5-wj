import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ant-design:switcher-filled',
      order: 2,
      title: '租户管理',
      authority: ['AbpTenantManagement'],
    },
    name: 'tenant',
    path: '/tenant',
    children: [
      {
        name: 'abpTenant',
        path: 'page',
        component: () => import('#/views/system/abptenant/index.vue'),
        meta: {
          icon: 'ph:user',
          title: '租户列表',
          authority: ['AbpTenantManagement.Tenants'],
        },
      }
    ],
  },
];

export default routes;
