import { formatServerParamStr } from '@/utils'
import QWebChannel from '@/utils/qwebchannel.js'
// eslint-disable-next-line no-undef

export function callCppFunction(callback) {
  const { MODE } = import.meta.env
  if (MODE === 'development') {
    // const result =
    //   'ecam://?server_ip=http://dev.koimy.com:1080/java_idp&file_path=http://dev.koimy.com:1080/e1make/2024-05-28/3550ae3a-42a7-4fae-a956-7a96fbc91cd9/gerber+2spec.rar&fileid=3550ae3a-42a7-4fae-a956-7a96fbc91cd9&tokenid=76ca0706-85dc-4f66-a8a4-6196abad2608&task_id=4982&urls=http://dev.koimy.com:1080/pcb_idp-web/#/multi-document-parsing/index?flag=1&id=4982&tokenid=76ca0706-85dc-4f66-a8a4-6196abad2608&tokenSatffId=baf99bfc-c430-48da-895a-c53557f8cd61&telphone=17817779031&userName=%E6%B5%8B%E8%AF%95'
    const result =
      '%7B%22server_ip%22:%22http://dev.koimy.com:1080/java_idp%22,%22file_path%22:%22http://ecam.koimy.com:1080/emake-file/2024-11-08/c5806850-ce04-4114-aa7b-cabf0b038e3c/1731046588762.rar%22,%22fileid%22:%22c5806850-ce04-4114-aa7b-cabf0b038e3c%22,%22tokenid%22:%221925302d-fbf4-4b36-b7ff-cbb6e099ca2b%22,%22task_id%22:%2288627%22,%22audit_status%22:1,%22staffId%22:%220caf69de-2d94-49af-b2c5-50f5e1184d5e%22,%22sourceFileName%22:%22demo333.rar%22,%22tokenUrl%22:%22http://dev.koimy.com:1080/java_idp/ecam/authverify%22,%22tokenSecret%22:%220c8cab196bfaa7dfde70e5e882c2ce1384380caef8db95e3cf320d35ea842537%22,%22urls%22:%22http://dev.koimy.com:1080/pcb_idp-web/#/multi-document-parsing/index?flag=1&id=88627&tokenid=1925302d-fbf4-4b36-b7ff-cbb6e099ca2b&tokenSatffId=0caf69de-2d94-49af-b2c5-50f5e1184d5e&telphone=15514352103&userName=hanpanfei&audit_status=1%22,%22zcurls%22:%22http://localhost:9528/pcb_uniontrans-web/#/process-capability1?fileid=c5806850-ce04-4114-aa7b-cabf0b038e3c&enterprise_uid=1925302d-fbf4-4b36-b7ff-cbb6e099ca2b&erp_factory=ooo&sessionid=87fa8d66-cf18-43cc-8882-8aff00e8a927%22%7D'
    window._globalServerParams = {
      file_path: '',
      fileid: '',
      tokenid: '',
      task_id: '',
      server_ip: '',
      ...formatServerParamStr(result),
    }
    callback(result)
  } else {
    if (window.qt) {
      new QWebChannel(window.qt.webChannelTransport, async function (channel) {
        window.bridge = channel.objects.CmdMgr
        var result = await window.bridge.getWebRequestParam()
        window._globalServerParams = {
          file_path: '',
          fileid: '',
          tokenid: '',
          task_id: '',
          server_ip: '',
          ...formatServerParamStr(result),
        }
        callback(result)
      })
    }
  }

  // const { MODE } = import.meta.env
  // // console.log('MODE:', MODE)
  // return new Promise((resolve, reject) => {
  //   // getWebRequestParam()
  //   // var result = window.bridge.getValue('test')
  //   // var result = window.bridge.getWebRequestParam()
  //   var result = ''
  //   if (MODE === 'development') {
  //     result =
  //       'ecam://?server_ip=http://dev.koimy.com:1080/java_idp&file_path=http://dev.koimy.com:1080/e1make/2024-05-28/3550ae3a-42a7-4fae-a956-7a96fbc91cd9/gerber+2spec.rar&fileid=3550ae3a-42a7-4fae-a956-7a96fbc91cd9&tokenid=76ca0706-85dc-4f66-a8a4-6196abad2608&task_id=4982&urls=http://dev.koimy.com:1080/pcb_idp-web/#/multi-document-parsing/index?flag=1&id=4982&tokenid=76ca0706-85dc-4f66-a8a4-6196abad2608&tokenSatffId=baf99bfc-c430-48da-895a-c53557f8cd61&telphone=17817779031&userName=%E6%B5%8B%E8%AF%95'

  //     resolve(result)
  //   } else {
  //     result = window.bridge.getValue('test')
  //     if (result) {
  //       resolve(result)
  //     } else {
  //       reject(result)
  //     }
  //   }
  // })
  //   .then((result) => {
  //     console.log('result:', result)
  //     alert('result:' + result) // 输出Promise的值
  //     // window._globalServerParams = parseURLParams(result)
  //     return result
  //   })
  //   .catch((error) => {
  //     // 在Promise被拒绝时执行的回调函数
  //     console.log('error' + error) // 输出Promise被拒绝的原因
  //   })

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
