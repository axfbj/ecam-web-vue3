import 'normalize.css'
import '@/style.css'
import '@/scss/global.scss'
import 'vxe-table/lib/style.css'
import 'element-plus/dist/index.css'
import 'vxe-pc-ui/lib/style.css'
import '@/utils/qwebchannel.js'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
// import { createPinia } from 'pinia'
import { createApp } from 'vue'
import VxeUI from 'vxe-pc-ui'
import VxeTable from 'vxe-table'

import { callCppFunction } from '@/utils/loadSparams.js'

import App from './Component.vue'
// 创建 Pinia 实例

callCppFunction(() => {
  const app = createApp(App)

  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  app.use(VxeUI).use(VxeTable).use(ElementPlus)

  app.mount('#app')
})
