import { message as Message } from 'ant-design-vue'
import { useUserStore, } from '@vben/stores';
import { useAuthStore } from '#/store';
import axios from 'axios'
import { antdLocale } from '#/locales/index'
const api = axios.create({
  baseURL: import.meta.env.DEV ? '/proxy/' : import.meta.env.VITE_APP_API_ADDRESS,
  timeout: 1000 * 60,
  responseType: 'blob', // 设置响应数据类型为blob
})

api.interceptors.request.use(
  (request) => {
    // const businessLine = localStorage.getItem("businessLine");
    // let key = "VITE_APP_API_BASEURL_BUSINESS_" + businessLine;
    // let api=  import.meta.env[key];
    // if(api == undefined){
    //   api = import.meta.env.VITE_APP_API_BASEURL_BUSINESS;
    // }
    // request.baseURL = import.meta.env.DEV ? '/businessProxy/' : api;
    // console.log(request.baseURL)
    // 全局拦截请求发送前提交的参数
    const userStore = useUserStore();
    const authStore = useAuthStore();
    const token = userStore.userInfo?.token;
  // 设置请求头
  if (request.headers) {
    request.headers['__tenant'] = userStore.tenant?.tenantId
    request.headers['accept-language'] = antdLocale.value.locale
   }
    // 如果token过期，则跳转到登录页面
    if (token) {
      if (userStore.checkUserLoginExpire()) {
        authStore.logout();
        return Promise.reject('用户登录已过期')
      }
    }

    // 设置请求头
    if (request.headers) {
      request.headers['Authorization'] = 'Bearer ' + token
    }
 
    return request
  },
)

api.interceptors.response.use(
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
        Message.error(response.data.error)
        return Promise.reject(response.data)
      }
    }
    else {
      // useUserStore().logout()
    }
    return Promise.resolve(response)
  },
  (error) => {
    const authStore = useAuthStore();
    
    let message = error.message
    if (message === 'Network Error') {
      message = '后端网络故障'
    }
    else if (message.includes('timeout')) {
      message = '接口请求超时'
    } else if (error.status === 403) {
      message = '权限不足'
    } else if (error.status === 401) {
      message = '登录状态失效，请重新登录'
      authStore.logout()
    } else if (error.status === 500) {
      message = error.response.data.error?.message || '服务器异常';
    }
    else if (message.includes('Request failed with status code')) {
      message = `接口${message.substr(message.length - 3)}异常`
    }
    Message.error(message)
    return Promise.reject(error)
  },
)


export default api
