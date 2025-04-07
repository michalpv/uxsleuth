import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';

// https://stackoverflow.com/questions/66389043/how-can-i-use-vite-env-variables-in-vite-config-js

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};

  // import.meta.env.VITE_NAME available here with: process.env.VITE_NAME
  // import.meta.env.VITE_PORT available here with: process.env.VITE_PORT

  return defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        src: resolve('./src'),
      },
    },
    server: {
      hmr: {
        clientPort: parseInt(process.env.VITE_HMR_SOCKET_PORT)
      },
      port: parseInt(process.env.VITE_PORT)
    }
  });
}