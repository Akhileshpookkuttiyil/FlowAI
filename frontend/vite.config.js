import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const rawApiUrl = (env.VITE_API_URL || env.REACT_APP_API_URL || '').trim();
  const normalizedApiTarget = rawApiUrl
    ? rawApiUrl.replace(/\/+$/, '').replace(/\/api$/, '')
    : 'http://localhost:5000';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: normalizedApiTarget,
          changeOrigin: true,
        },
      },
    },
    define: {
      'process.env.REACT_APP_API_URL': JSON.stringify(env.REACT_APP_API_URL || ''),
    },
  }
})
