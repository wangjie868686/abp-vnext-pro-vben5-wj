import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import {message as Message} from 'ant-design-vue';
import { DEFAULT_HOME_PATH, LOGIN_PATH } from '@vben/constants';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { $t } from '#/locales';
import { postApiAppAccountLogin, getApiAbpApplicationConfiguration,postTenantsFind, type ApplicationConfigurationDto, type ApplicationAuthConfigurationDto } from '#/api-client';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      //  判断是否租户登录
      if (params.tenant) {
        const tenantResult = await postTenantsFind({
          body: {
            'name': params.tenant,
          }
        });
        if(!tenantResult.data?.success){
          Message.error(params.tenant+"租户不存在")
          return;
        }else{
          userStore.setTenantInfo(tenantResult.data as any)
        }
      }


      loginLoading.value = true;
      const { data = {} } = await postApiAppAccountLogin({
        body: {
          ...params,
        }
      });
      // 如果成功获取到 accessToken
      if (data.token) {
        accessStore.setAccessToken(data.token);
        userInfo = data as any;
        userStore.setUserInfo(userInfo as any);
        const { data: authData } = await getApiAbpApplicationConfiguration({ query: { IncludeLocalizationResources: false } })
        const { auth } = authData as ApplicationConfigurationDto;
        const accessCodes =  Object.keys((auth as ApplicationAuthConfigurationDto).grantedPolicies as unknown as Record<string, any>)
        accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(DEFAULT_HOME_PATH);
        }

        if (userInfo?.realName) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      //await logoutApi();
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
          redirect: encodeURIComponent(router.currentRoute.value.fullPath),
        }
        : {},
    });
  }

  async function fetchUserInfo() {
    let userInfo: null | UserInfo = null;
    // userInfo = await getUserInfoApi();
    // userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
