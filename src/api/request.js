import axios from 'axios'
import { ElMessage } from 'element-plus'

// const serverParams = store.serverParams
// create an axios instance
// axios.defaults.withCredentials = true
// const { VITE_APP_API, MODE } = import.meta.env
// console.log('VITE_APP_API', VITE_APP_API)

// console.log(ENV)
// console.log(MODE)

// const server_url = MODE === 'development' ? VITE_APP_API : VITE_APP_API + window._globalParams.request_path
// const server_url = window?._globalServerParams?.url
// console.log('server_url', server_url)

// console.log(VITE_APP_API, 'VITE_APP_API')

const service = axios.create({
  // baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  baseURL: '', // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  // crossDomain: true,
  timeout: 30000, // request timeout
})

// request interceptor 请求拦截
service.interceptors.request.use(
  // do something before request is sent
  async (config) => {
    return config
  },
  // config => config,

  (error) => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor 响应拦截
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  async (response) => {
    if (response.status === 200) {
      let res = {}
      if (Object.hasOwnProperty.call(response, 'data')) {
        res = response.data
      }
      return res
    }
  },
  (error) => {
    console.log('err' + error) // for debug
    ElMessage.error(error.message)
    return Promise.reject(error)
  }
)

export default service
