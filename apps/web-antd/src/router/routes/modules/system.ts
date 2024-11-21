import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:layout-dashboard',
      order: 1,
      title: '系统管理',
      authority: ['AbpIdentity'],
    },
    name: 'system',
    path: '/system',
    children: [
      {
        name: 'abpUser',
        path: 'user',
        component: () => import('#/views/system/abpUser/index.vue'),
        meta: {
          // affixTab: true,
          icon: 'ph:user',
          title: '用户管理',
          authority: ['AbpIdentity.Users'],
        },
      },
      {
        name: 'abpRole',
        path: 'role',
        component: () => import('#/views/system/abprole/index.vue'),
        meta: {
          icon: 'oui:app-users-roles',
          title: '角色管理',
          authority: ['AbpIdentity.Roles'],
        },
      },
      {
        name: 'OrganizationUnit',
        path: 'organizationUnit',
        component: () => import('#/views/system/organizationUnit/index.vue'),
        meta: {
          title: '组织机构管理',
          // authority: ['AbpIdentity.LanguageTexts'],
          icon: 'ant-design:team-outlined',
        },
      },
      {
        name: 'abpSetting',
        path: 'setting',
        component: () => import('#/views/system/abpsetting/index.vue'),
        meta: {
          icon: 'uil:setting',
          title: '设置管理',
          authority: ['AbpIdentity.Setting'],
        },
      },
      {
        name: 'abpfeature',
        path: 'Feature',
        component: () => import('#/views/system/abpfeature/index.vue'),
        meta: {
          icon: 'ant-design:tool-outlined',
          title: '功能管理',
          authority: ['AbpIdentity.FeatureManagement'],
        },
      },
      {
        name: 'AbpAuditLog',
        path: 'auditlog',
        component: () => import('#/views/system/abplog/audit.vue'),
        meta: {
          title: '审计日志',
          authority: ['AbpIdentity.AuditLog'],
          icon: 'ant-design:snippets-twotone',
        },
      },
      {
        name: 'AbpLoginLog',
        path: 'loginlog',
        component: () => import('#/views/system/abplog/login.vue'),
        meta: {
          title: '登录日志',
          authority: ['AbpIdentity.IdentitySecurityLogs'],
          icon: 'ant-design:file-protect-outlined',
        },
      },
      {
        name: 'AboLanguage',
        path: 'language',
        component: () => import('#/views/system/abplanguage/language.vue'),
        meta: {
          title: '语言管理',
          authority: ['AbpIdentity.Languages'],
          icon: 'ant-design:read-outlined',
        },
      },
      {
        name: 'AboLanguageText',
        path: 'languagetext',
        component: () => import('#/views/system/abplanguage/languagetext.vue'),
        meta: {
          title: '语言文本管理',
          authority: ['AbpIdentity.LanguageTexts'],
          icon: 'ant-design:font-size-outlined',
        },
      },
      {
        name: 'DataDictionary',
        path: 'data-dictionary',
        component: () => import('#/views/system/dataDictionary/index.vue'),
        meta: {
          title: '数据字典',
          // authority: ['AbpIdentity.LanguageTexts'],
          icon: 'ant-design:database-outlined',
        },
      },
      {
        name: 'AbpNotification',
        path: 'notification',
        component: () =>
          import('#/views/system/abpnotification/notification.vue'),
        meta: {
          title: '通告管理',
          authority: ['AbpIdentity.NotificationSubscriptionManagement'],
          icon: 'ant-design:comment-outlined',
        },
      },
      {
        name: 'AbpMessage',
        path: 'message',
        component: () => import('#/views/system/abpnotification/message.vue'),
        meta: {
          title: '消息管理',
          authority: ['AbpIdentity.NotificationManagement'],
          icon: 'ant-design:customer-service-twotone',
        },
      },
    ],
  },
];

export default routes;
