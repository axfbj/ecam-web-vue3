import { fileURLToPath, URL } from 'node:url'

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  server: {
    open: 'www/dr-structure-dlg/index.html', // 修改启动时打开的路径
  },
  plugins: [
    vue(),
    legacy({
      targets: ['Chrome >= 78'],
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/scss/variables.scss";`, // 如果你有全局的变量或混合文件，可以在这里导入
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'D:/code/qt_svn/ECAM/trunk/lib/X64/Release/html',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'www/stack-impedance/index.html'),
        drStructure: resolve(__dirname, 'www/dr-structure-dlg/index.html'),
      },
    },
  },
})
