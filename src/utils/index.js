export function parseURLParams(url) {
  if (!url || typeof url !== 'string') return {}

  const parts = url.split('?')
  if (parts.length < 2) return {}

  const paramsString = parts[1]
  if (!paramsString) return {}

  const paramsArray = paramsString.split('&')
  const paramsObject = {}

  paramsArray.forEach((param) => {
    const [key, value] = param.split('=')
    if (key) {
      paramsObject[key] = value ? decodeURIComponent(value) : ''
    }
  })

  return paramsObject
}

export function formatServerParamStr(serverParamStr) {
  if (!serverParamStr || typeof serverParamStr !== 'string') return {}
  const newStr = decodeURIComponent(serverParamStr)
  return isJSON(newStr) ? JSON.parse(newStr) : parseURLParams(newStr)
}

export function isJSON(str) {
  if (typeof str !== 'string') return false // 确保是字符串
  try {
    const parsed = JSON.parse(str) // 尝试解析
    // 确保解析结果是对象或数组
    return typeof parsed === 'object' && parsed !== null
  } catch (e) {
    return false // 如果解析失败，返回 false
  }
}
