import { useUserStore } from '@vben/stores';

import { message as Message } from 'ant-design-vue';

import { antdLocale } from '#/locales/index';
import { useAuthStore } from '#/store';

import { client } from '../api-client/services.gen';

client.setConfig({
  baseURL: import.meta.env.DEV
    ? '/proxy/'
    : import.meta.env.VITE_APP_API_ADDRESS,
  timeout: 1000 * 60,
  responseType: 'json',
  throwOnError: true,
});

client.instance.interceptors.request.use((request) => {
  // 全局拦截请求发送前提交的参数
  const userStore = useUserStore();
  const token = userStore.userInfo?.token;
  // 设置请求头
  if (request.headers) {
    request.headers.__tenant = userStore.tenant?.tenantId;
    // todo vben5 没有提供统一获取当前语言的方式
    request.headers['accept-language'] = antdLocale.value.locale;
  }

  // 如果token过期，则跳转到登录页面
  if (
    request.url !== undefined &&
    request.url.includes('/api/app/account/login')
  ) {
    return request;
  }

  if (token && userStore.checkUserLoginExpire()) {
    const authStore = useAuthStore();
    authStore.logout();
    Message.warn('用户登录已过期');
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject('用户登录已过期');
  }

  // 设置请求头
  if (request.headers) {
    request.headers.Authorization = `Bearer ${token}`;
  }

  return request;
});

client.instance.interceptors.response.use(
  (response) => {
    /**
     * 全局拦截请求发送后返回的数据，如果数据有报错则在这做全局的错误提示
     * 假设返回数据格式为：{ status: 1, error: '', data: '' }
     * 规则是当 status 为 1 时表示请求成功，为 0 时表示接口需要登录或者登录状态失效，需要重新登录
     * 请求出错时 error 会返回错误信息
     */
    if (response.data.status === 1) {
      if (response.data.error !== '') {
        // 错误提示
        Message.error(response.data.error);
        return Promise.reject(response.data);
      }
    } else {
      // useUserStore().logout()
    }
    return Promise.resolve(response);
  },
  (error) => {
    let message = error.message;
    if (message === 'Network Error') {
      message = '后端网络故障';
    } else if (message.includes('timeout')) {
      message = '接口请求超时';
    } else
      switch (error.status) {
        case 400: {
          message = error.response.data.error?.details || '服务器异常';

          break;
        }
        case 401: {
          message = '登录状态失效，请重新登录';
          // useUserStore().logout()

          break;
        }
        case 403: {
          message = '您没有操作权限';

          break;
        }
        case 500: {
          message = error.response.data.error?.message || '服务器异常';

          break;
        }
        default: {
          if (message.includes('Request failed with status code')) {
            message = `接口${message.slice(-3)}异常`;
          }
        }
      }
    Message.error(message);
    return Promise.reject(error);
  },
);

export default client;
