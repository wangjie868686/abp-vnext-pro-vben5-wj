import { defineConfig } from '@vben/vite-config';

import ElementPlus from 'unplugin-element-plus/vite';
import { loadEnv } from 'vite';

export default defineConfig(async (config) => {
  const { command, mode } = config as { command: string; mode: string };
  const env = loadEnv(mode, process.cwd());
  console.log(env, '-----------env', command);
  return {
    application: {},
    vite: {
      plugins: [
        ElementPlus({
          format: 'esm',
        }),
      ],
      server: {
        proxy: {
          '/proxy': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/proxy/, ''),
            // mock代理目标地址
            target: env.VITE_APP_API_ADDRESS,
            ws: true,
          },
          // '/api': {
          //   changeOrigin: true,
          //   rewrite: (path) => path.replace(/^\/api/, ''),
          //   // mock代理目标地址
          //   target: 'http://localhost:5320/api',
          //   ws: true,
          // },
        },
      },
    },
  };
});
