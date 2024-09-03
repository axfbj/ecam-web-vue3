import { fileURLToPath, URL } from 'node:url'

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
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
    outDir: 'D:/code/QT_Code/qmlDemo V2/qmlDemo/bin/X64/Release',
    emptyOutDir: false,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'test.html'),
      },
    },
  },
})
