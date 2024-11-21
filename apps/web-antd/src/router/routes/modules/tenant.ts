import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ant-design:switcher-filled',
      order: 2,
      title: $t('abp.menu.tenant'),
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
          title: $t('abp.menu.tenantList'),
          authority: ['AbpTenantManagement.Tenants'],
        },
      },
    ],
  },
];

export default routes;
