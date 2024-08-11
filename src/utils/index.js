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
