const helper = {
  // 根据name获取地址栏的参数值
  getQueryString(name) {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`)
    const hash = window.location.hash
    const search = hash.split('?')
    const r = search[1] && search[1].match(reg)
    if (r != null) return r[2]
    return ''
  },
  // 拼接参数至url
  queryString(url, query) {
    const str = []
    for (const key in query) {
      if (Object.hasOwnProperty.call(query, key)) {
        str.push(key + '=' + query[key])
      }
    }
    const paramStr = str.join('&')
    return paramStr ? `${url}?${paramStr}` : url
  },
}

export default helper
