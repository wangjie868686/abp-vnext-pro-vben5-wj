import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: $t('demos.title'),
    },
    name: 'Demos',
    path: '/demos',
    children: [
      {
        meta: {
          title: $t('demos.naive'),
          icon: 'logos:naiveui',
        },
        name: 'NaiveDemos',
        path: '/demos/naive',
        component: () => import('#/views/demos/naive/index.vue'),
      },
      // {
      //   meta: {
      //     title: $t('demos.table'),
      //   },
      //   name: 'Table',
      //   path: '/demos/table',
      //   component: () => import('#/views/demos/table/index.vue'),
      // },
    ],
  },
];

export default routes;
