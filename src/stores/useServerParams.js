// src/stores/useDataStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

import { parseURLParams } from '@/utils'

export const useServerParamsStore = defineStore('serverParams', () => {
  // 定义变量
  const serverParams = ref(null)

  // 定义获取数据的方法
  async function fetchData() {
    // 如果数据已经存在，直接返回
    if (serverParams.value) {
      return serverParams.value
    }
    return await refreshData()
  }

  // 定义刷新数据的方法
  async function refreshData() {
    serverParams.value = await new Promise((resolve, reject) => {
      // getWebRequestParam()
      // var result = window.bridge.getValue('test')
      var str =
        'ecam://?server_ip=http://dev.koimy.com:1080/java_idp&file_path=http://dev.koimy.com:1080/e1make/2024-05-28/3550ae3a-42a7-4fae-a956-7a96fbc91cd9/gerber+2spec.rar&fileid=3550ae3a-42a7-4fae-a956-7a96fbc91cd9&tokenid=76ca0706-85dc-4f66-a8a4-6196abad2608&task_id=4982&urls=http://dev.koimy.com:1080/pcb_idp-web/#/multi-document-parsing/index?flag=1&id=4982&tokenid=76ca0706-85dc-4f66-a8a4-6196abad2608&tokenSatffId=baf99bfc-c430-48da-895a-c53557f8cd61&telphone=17817779031&userName=%E6%B5%8B%E8%AF%95'
      if (str) {
        serverParams.value = parseURLParams(str)
        resolve(serverParams.value)
      } else {
        reject(this.status)
      }
    })
    return serverParams.value
  }

  return {
    serverParams,
    fetchData,
    refreshData,
  }
})
