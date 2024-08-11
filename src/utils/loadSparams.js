import { parseURLParams } from '@/utils'
import QWebChannel from '@/utils/qwebchannel.js'
// eslint-disable-next-line no-undef
if (window.qt) {
  new QWebChannel(window.qt.webChannelTransport, function (channel) {
    window.bridge = channel.objects.CmdMgr
  })
}

export async function callCppFunction() {
  return new Promise((resolve, reject) => {
    // getWebRequestParam()
    // var result = window.bridge.getValue('test')
    var result =
      'ecam://?server_ip=http://dev.koimy.com:1080/java_idp&file_path=http://dev.koimy.com:1080/e1make/2024-05-28/3550ae3a-42a7-4fae-a956-7a96fbc91cd9/gerber+2spec.rar&fileid=3550ae3a-42a7-4fae-a956-7a96fbc91cd9&tokenid=76ca0706-85dc-4f66-a8a4-6196abad2608&task_id=4982&urls=http://dev.koimy.com:1080/pcb_idp-web/#/multi-document-parsing/index?flag=1&id=4982&tokenid=76ca0706-85dc-4f66-a8a4-6196abad2608&tokenSatffId=baf99bfc-c430-48da-895a-c53557f8cd61&telphone=17817779031&userName=%E6%B5%8B%E8%AF%95'
    if (result) {
      window._globalServerParams = parseURLParams(result)
      resolve(window._globalServerParams)
    } else {
      reject(this.status)
    }
  })

  // return myPromise
  //   .then((result) => {
  //     // 在Promise被解析时执行的回调函数
  //     // alert('result:' + result) // 输出Promise的值

  //     window._globalServerParams = result
  //     console.log('result:', result)
  //   })
  //   .catch((error) => {
  //     // 在Promise被拒绝时执行的回调函数
  //     console.log('error' + error) // 输出Promise被拒绝的原因
  //   })
}
// console.log('callCppFunction')
// callCppFunction()