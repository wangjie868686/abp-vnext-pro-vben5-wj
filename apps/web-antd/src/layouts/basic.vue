<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import { computed, onMounted, ref, watch } from 'vue';

import {
  AuthenticationLoginExpiredModal,
  useVbenModal,
  z,
} from '@vben/common-ui';
import { useWatermark } from '@vben/hooks';
import { CircleHelp } from '@vben/icons';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';

import { message as Message } from 'ant-design-vue/es/components';

import { useVbenForm } from '#/adapter/form';
import { postUsersChangePassword } from '#/api-client';
import { useSignalR } from '#/hooks/useSignalR';
import { useAuthStore } from '#/store';
import LoginForm from '#/views/_core/authentication/login.vue';

const notifications = ref<NotificationItem[]>([
  {
    avatar: 'https://avatar.vercel.sh/vercel.svg?text=VB',
    date: '3小时前',
    isRead: true,
    message: '描述信息描述信息描述信息',
    title: '收到了 14 份新周报',
  },
  {
    avatar: 'https://avatar.vercel.sh/1',
    date: '刚刚',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '朱偏右 回复了你',
  },
  {
    avatar: 'https://avatar.vercel.sh/1',
    date: '2024-01-01',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '曲丽丽 评论了你',
  },
  {
    avatar: 'https://avatar.vercel.sh/satori',
    date: '1天前',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '代办提醒',
  },
]);
const { startConnect } = useSignalR();
onMounted(() => {
  startConnect();
});
const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();
const showDot = computed(() =>
  notifications.value.some((item) => !item.isRead),
);
const [ResetPasswordModal, resetPasswordModalApi] = useVbenModal({
  draggable: true,
  onConfirm: submit,
  onBeforeClose: () => {},
});
const menus = computed(() => [
  {
    handler: () => {
      resetPasswordModalApi.open();
    },
    icon: CircleHelp,
    text: '修改密码',
  },
  // {
  //   handler: () => {
  //     openWindow(VBEN_DOC_URL, {
  //       target: '_blank',
  //     });
  //   },
  //   icon: BookOpenText,
  //   text: $t('ui.widgets.document'),
  // },
  // {
  //   handler: () => {
  //     openWindow(VBEN_GITHUB_URL, {
  //       target: '_blank',
  //     });
  //   },
  //   icon: MdiGithub,
  //   text: 'GitHub',
  // },
  // {
  //   handler: () => {
  //     openWindow(`${VBEN_GITHUB_URL}/issues`, {
  //       target: '_blank',
  //     });
  //   },
  //   icon: CircleHelp,
  //   text: $t('ui.widgets.qa'),
  // },
]);
const [ResetPasswordForm, resetPasswordApi] = useVbenForm({
  // 默认展开
  collapsed: false,
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-4/5',
    },
  },
  // 提交函数
  handleSubmit: () => {},
  layout: 'horizontal',
  schema: [
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: '请输入当前密码',
      },
      fieldName: 'currentPassword',
      label: '当前密码',
      rules: z.string().min(1, { message: '请输入当前密码' }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: '请输入新密码',
      },
      fieldName: 'newPassword',
      label: '新密码',
      rules: z.string().min(1, { message: '请输入当前密码' }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: '请输入确认新密码',
      },
      fieldName: 'confirmPassword',
      label: '确认密码',
      rules: z.string().min(1, { message: '请输入当前密码' }),
    },
  ],
  showCollapseButton: false,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});
const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}

function handleNoticeClear() {
  notifications.value = [];
}

function handleMakeAll() {
  notifications.value.forEach((item) => (item.isRead = true));
}
async function submit() {
  // 表单校验
  const { valid } = await resetPasswordApi.validate();
  if (!valid) return;
  const formValues = await resetPasswordApi.getValues();

  if (formValues.currentPassword === formValues.confirmPassword) {
    Message.warn('新旧密码不能一样.');
    return;
  }
  if (formValues.newPassword !== formValues.confirmPassword) {
    Message.warn('两次密码输入不一致.');
    return;
  }
  await postUsersChangePassword({ body: formValues });
  Message.success('修改成功');
  await resetPasswordApi.resetForm();
  resetPasswordModalApi.close();
}
watch(
  () => preferences.app.watermark,
  async (enable) => {
    if (enable) {
      await updateWatermark({
        content: `${userStore.userInfo?.username}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :tag-text="userStore.tenant?.name"
        :text="userStore.userInfo?.name"
        @logout="handleLogout"
      />
    </template>
    <template #notification>
      <Notification
        :dot="showDot"
        :notifications="notifications"
        @clear="handleNoticeClear"
        @make-all="handleMakeAll"
      />
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
  <ResetPasswordModal class="w-[600px]" title="修改密码">
    <ResetPasswordForm />
  </ResetPasswordModal>
</template>
