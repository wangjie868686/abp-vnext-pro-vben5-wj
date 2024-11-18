import type { RouteRecordRaw } from 'vue-router';

import {
  VBEN_DOC_URL,
  VBEN_ELE_PREVIEW_URL,
  VBEN_GITHUB_URL,
  VBEN_LOGO_URL,
  VBEN_NAIVE_PREVIEW_URL,
} from '@vben/constants';

import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      badgeType: 'dot',
      icon: 'ph:file-doc-light',
      order: 9999,
      title: $t('demos.vben.title'),
    },
    name: 'VbenProject',
    path: '/vben-admin',
    children: [
      // {
      //   name: 'VbenAbout',
      //   path: '/vben-admin/about',
      //   component: () => import('#/views/_core/about/index.vue'),
      //   meta: {
      //     icon: 'lucide:copyright',
      //     title: $t('demos.vben.about'),
      //   },
      // },
      {
        name: 'VbenDocument',
        path: '/vben-admin/document',
        component: IFrameView,
        meta: {
          icon: 'lucide:book-open-text',
          link: 'https://doc.cncore.club/',
          title: 'ABPPro文档',
        },
      },
      {
        name: 'VbenDocument',
        path: '/vben-admin/document',
        component: IFrameView,
        meta: {
          icon: 'lucide:book-open-text',
          link: 'https://abp.io/docs/latest/',
          title: 'ABP官方文档',
        },
      },
      {
        name: 'VbenGithub',
        path: '/vben-admin/github',
        component: IFrameView,
        meta: {
          icon: 'mdi:github',
          link: 'https://github.com/WangJunZzz/abp-vnext-pro',
          title: 'Github',
        },
      }
    ],
  },
];

export default routes;
