import { acceptHMRUpdate, defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
interface BasicUserInfo {
  [key: string]: any;
  /**
   * 头像
   */
  avatar: string;
  /**
   * 用户昵称
   */
  realName: string;
  /**
   * 用户角色
   */
  roles?: string[];
  /**
   * 用户id
   */
  userId: string;
  /**
   * 用户名
   */
  username: string;
}
interface BasicTenantInfo {

  /**
   * 租户Id
   */
  tenantId: string;
  /**
   * 租户名称
   */
  name: string;
}

interface AccessState {
  /**
   * 用户信息
   */
  userInfo: BasicUserInfo | null;
  /**
   * 用户角色
   */
  userRoles: string[];

  /**
   * 租户信息
   */
  tenant: BasicTenantInfo | null;
}

/**
 * @zh_CN 用户信息相关
 */
export const useUserStore = defineStore('core-user', {
  actions: {
    setUserInfo(userInfo: BasicUserInfo | null) {
      // 设置用户信息
      this.userInfo = userInfo;
      // 设置角色信息
      const roles = userInfo?.roles ?? [];
      this.setUserRoles(roles);
    },
    setUserRoles(roles: string[]) {
      this.userRoles = roles;
    },
    setTenantInfo(tenantInfo: BasicTenantInfo | null) {
      this.tenant = tenantInfo;
    },
    // 检验token是否过期
    checkUserLoginExpire(): boolean {
      try {
        const myToken = this.userInfo?.token;
        const decoded: any = jwtDecode(myToken || '');
        // 获取当前时间戳
        const currentTimeStamp = new Date().getTime() / 1000;
        return currentTimeStamp >= decoded.exp;
      } catch (error) {
        return true;
      }
    }
  },
  state: (): AccessState => ({
    userInfo: null,
    tenant: null,
    userRoles: [],
  }),
  persist: {
    // 持久化
    pick: ['userInfo', 'userRoles','tenant'],
  },
});

// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useUserStore, hot));
}
