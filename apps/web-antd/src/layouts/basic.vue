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
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import {
  postNotificationBatchRead,
  postNotificationNotificationPage,
  postNotificationRead,
  postUsersChangePassword,
} from '#/api-client';
import { useSignalR } from '#/hooks/useSignalR';
import { useAuthStore } from '#/store';
import LoginForm from '#/views/_core/authentication/login.vue';

import NotifyItem from './NotifyItem.vue';

const notifications = ref<NotificationItem[]>([]);
const { startConnect } = useSignalR();
function convertToNotificationItem(message: any): NotificationItem {
  return {
    avatar: '',
    date: dayjs(message.creationTime).format('YYYY-MM-DD HH:mm:ss'),
    isRead: message.read,
    message: message.content,
    title: message.title,
    id: message.id,
  };
}
const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
onMounted(async () => {
  startConnect();
});

const { destroyWatermark, updateWatermark } = useWatermark();
const showDot = computed(() =>
  notifications.value.some((item) => !item.isRead),
);
const [ResetPasswordModal, resetPasswordModalApi] = useVbenModal({
  draggable: true,
  onConfirm: submit,
  onBeforeClose: () => {},
});
const [NotifyItemModal, notifyItemModalApi] = useVbenModal({
  draggable: true,
  onConfirm: () => {},
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

async function handleMakeAll() {
  // 获取notifications 已读的数据，并且请求api 标记为已读
  const readIds = notifications.value
    .filter((item) => item.isRead)
    .map((item) => item.id);

  if (readIds.length > 0) {
    await postNotificationBatchRead({ body: { ids: readIds } });
    Message.success('设置成功');
  }

  notifications.value.forEach((item) => (item.isRead = true));
}

async function handleRead(row: NotificationItem) {
  if (row.isRead) {
    return;
  }
  await postNotificationRead({ body: { id: row.id } });

  notifications.value.forEach((item) => {
    if (item.id === row.id) {
      item.isRead = true;
    }
  });
}
function handleViewAll() {
  notifyItemModalApi.open();
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

async function loadMessage() {
  const message = await postNotificationNotificationPage({
    body: {
      pageIndex: 1,
      pageSize: 4,
      messageType: 20,
      receiverUserId: userStore.userInfo?.userId,
    },
  });
  message.data?.items?.forEach((item) => {
    notifications.value.push(convertToNotificationItem(item));
    // 按照isRead属性进行排序
    notifications.value.sort((a, b) => {
      if (a.isRead === b.isRead) {
        return 0;
      }
      return a.isRead ? 1 : -1;
    });
  });
}
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
        @icon-click="loadMessage"
        @make-all="handleMakeAll"
        @read="handleRead"
        @view-all="handleViewAll"
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

  <NotifyItemModal
    :fullscreen="true"
    :show-cancel-button="false"
    :show-confirm-button="false"
  >
    <NotifyItem />
  </NotifyItemModal>
</template>
