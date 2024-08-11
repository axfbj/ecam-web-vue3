import helper from './helper'
import request from './request'

// import { getToken } from '@/utils/auth'
// const qs = require('querystring')

// console.log(process.env.NODE_ENV)
// 判断环境提供baseURL，注意要与后台地址一致
// const isDev = process.env.NODE_ENV === 'development'
//   // 开发环境api接口
//   // ? `http://192.168.1.245:9527/`
//   ? ``
//   // 生产环境api接口
//   : `http://127.0.0.1:9527`
// // 引用axios，设置头文件

// request.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
// request.defaults.headers.post['Content-Type'] = 'application/json' // raw 格式

const serialize = (data) => {
  const list = []
  Object.keys(data).forEach((ele) => {
    list.push(`${ele}=${data[ele]}`)
  })
  return list.join('&')
}

async function apiAxios(method, url, params, contentType, config) {
  // console.log(JSON.parse(JSON.stringify(window._globalServerParams)))
  request.defaults.baseURL = window._globalServerParams.server_ip

  if (contentType === 'form') {
    request.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
  } else if (contentType === 'formData') {
    request.defaults.headers.post['Content-Type'] = 'multipart/form-data'
  } else {
    request.defaults.headers.post['Content-Type'] = 'application/json'
  }

  const d = method === 'POST' || method === 'PUT' ? (contentType === 'form' ? serialize(params) : JSON.stringify(params)) : null

  try {
    const p = {
      method,
      // 拼接参数
      url: method === 'GET' || method === 'DELETE' ? helper.queryString(url, params) : url,
      data: contentType === 'formData' ? params : d,
      // headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
      // baseURL: baseUrl,
      ...config,
    }
    if (contentType === 'excel') {
      p.responseType = 'blob'
    }
    return await request(p)
  } catch (error) {
    // console.log(error)
    return {
      code: 3000,
      data: false,
    }
  }
}

export default {
  get(url, params, contentType, config) {
    return apiAxios('GET', url, params, contentType, config)
  },
  post(url, params, contentType, config) {
    return apiAxios('POST', url, params, contentType, config)
  },
  put(url, params) {
    return apiAxios('PUT', url, params)
  },
  delete(url, params) {
    return apiAxios('DELETE', url, params)
  },
}
