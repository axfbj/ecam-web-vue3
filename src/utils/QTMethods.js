import { isJSON } from '@/utils'
export async function saveFile(data, filePath = 'localStorageFiles/stackImpedance.json') {
  if (!window.qt) return
  const rootPath = await window.bridge.getAppDir()
  const fullPath = `${rootPath}/${filePath}`
  const result = await window.bridge.saveFile(fullPath, JSON.stringify(data))
  return Boolean(result)
}

export async function readFile(filePath = 'localStorageFiles/stackImpedance.json') {
  if (!window.qt) return
  const rootPath = await window.bridge.getAppDir()
  const fullPath = `${rootPath}/${filePath}`
  const dataStr = await window.bridge.readFile(fullPath)
  return isJSON(dataStr) ? JSON.parse(dataStr) : {}
}
