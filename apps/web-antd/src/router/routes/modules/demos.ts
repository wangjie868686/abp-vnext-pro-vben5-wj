import type { RouteRecordRaw } from 'vue-router';

import { SvgAntdvLogoIcon } from '@vben/icons';

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
          title: $t('demos.antd'),
          icon: SvgAntdvLogoIcon,
        },
        name: 'AntDesignDemos',
        path: '/demos/ant-design',
        component: () => import('#/views/demos/antd/index.vue'),
      },
      // {
      //   meta: {
      //     title: '列表页示例',
      //   },
      //   name: 'ListPageDemos',
      //   path: '/demos/list-page',
      //   component: () => import('#/views/demos/listPage/index.vue'),
      // },
      {
        path: 'page',
        name: 'BookPage',
        component: () => import('#/views/Books/index.vue'),
        meta: {
          icon: 'ph:user',
          title: '书籍列表',
          // authority: ['这里写权限code'],
        },
      },
    ],
  },
];

export default routes;
