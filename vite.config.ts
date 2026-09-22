import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  // Determine backend proxy target: VITE_BACKEND_TARGET > VITE_API_URL host > localhost:3000
  let backendTarget = env.VITE_BACKEND_TARGET;
  if (!backendTarget && env.VITE_API_URL) {
    backendTarget = env.VITE_API_URL.replace(/\/api\/v1\/?$/, '');
  }
  if (!backendTarget) {
    backendTarget = 'http://localhost:3000';
  }

  return {
    server: {
      host: true,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: true,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [
      react(),
      tailwindcss()
    ],
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three')) {
              return 'vendor-three';
            }
            if (id.includes('node_modules/@samasante/liquid-glass')) {
              return 'vendor-glass';
            }
            if (id.includes('node_modules/framer-motion') || id.includes('node_modules/lenis')) {
              return 'vendor-motion';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom')
            ) {
              return 'vendor-react';
            }
          },
        },
      },
    },
  };
});
