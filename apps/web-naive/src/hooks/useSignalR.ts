import { useUserStore } from '@vben/stores';

import * as signalR from '@microsoft/signalr';

import { notification } from '#/adapter/naive';

let connection: signalR.HubConnection;
export function useSignalR() {
  /**
   * 开始连接SignalR
   */
  async function startConnect() {
    try {
      connectionsignalR();
      await connection.start();
    } catch (error) {
      console.error(error);
      setTimeout(() => startConnect(), 5000);
    }
  }

  /**
   * 关闭SignalR连接
   */
  function closeConnect(): void {
    8;
    if (connection) {
      connection.stop();
    }
  }

  async function connectionsignalR() {
    const userStore = useUserStore();
    const token = userStore.userInfo?.token;
    connection = new signalR.HubConnectionBuilder()
      .withUrl(import.meta.env.VITE_WEBSOCKET_URL, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // 重连规则：重连次数<300：间隔1s;重试次数<3000:间隔3s;重试次数>3000:间隔30s
          const count = retryContext.previousRetryCount / 300;
          if (count < 1) {
            // 重试次数<300,间隔1s
            return 1000;
          } else if (count < 10) {
            // 重试次数>300:间隔5s
            return 1000 * 5;
          } // 重试次数>3000:间隔30s
          else {
            return 1000 * 30;
          }
        },
      })
      .configureLogging(signalR.LogLevel.Debug)
      .build();

    // 接收普通文本消息
    connection.on('ReceiveTextMessageAsync', ReceiveTextMessageHandlerAsync);
    // 接收广播消息
    connection.on(
      'ReceiveBroadCastMessageAsync',
      ReceiveBroadCastMessageHandlerAsync,
    );
  }

  /**
   * 接收文本消息
   * @param message 消息体
   */
  function ReceiveTextMessageHandlerAsync(message: any) {
    if (message.messageLevel === 10) {
      notification.warning({
        description: message.content,
        content: message.title,
        duration: 3000,
      });
      notification.warning({
        content: message.title,
        description: message.content,
        duration: 3000,
      });
    }
    if (message.messageLevel === 20) {
      notification.info({
        content: message.title,
        description: message.content,
        duration: 3000,
      });
    }
    if (message.messageLevel === 30) {
      notification.error({
        content: message.title,
        description: message.content,
        duration: 3000,
      });
    }
  }

  /**
   * 接收广播消息
   * @param message 消息体
   */
  function ReceiveBroadCastMessageHandlerAsync(message: any) {
    if (message.messageLevel === 10) {
      notification.warning({
        content: message.title,
        description: message.content,
        duration: 3000,
      });
    }
    if (message.messageLevel === 20) {
      notification.info({
        content: message.title,
        description: message.content,
        duration: 3000,
      });
    }
    if (message.messageLevel === 30) {
      notification.error({
        content: message.title,
        description: message.content,
        duration: 3000,
      });
    }
  }

  return { startConnect, closeConnect };
}
