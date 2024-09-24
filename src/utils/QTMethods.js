// import { isJSON } from '@/utils'

import { isJSON } from '.'

export async function getAppDir() {
  return await window.bridge.getAppDir()
}
export async function saveFile(data, filePath) {
  if (!window.qt) return
  const rootPath = await getAppDir()
  const fullPath = `${rootPath}/${filePath}`
  const result = await window.bridge.saveFile(fullPath, data)
  return Boolean(result)
}

export async function readFile(filePath) {
  if (!window.qt) return
  const rootPath = await getAppDir()
  const fullPath = `${rootPath}/${filePath}`
  const dataStr = await window.bridge.readFile(fullPath)
  return dataStr
}

export async function readFileBase64(filePath) {
  if (!window.qt) return
  const rootPath = await getAppDir()
  const fullPath = `${rootPath}/${filePath}`
  const dataStr = await window.bridge.readFileAsBase64(fullPath)
  return dataStr
}

export async function saveFileByBase64(data, filePath) {
  if (!window.qt) return
  const rootPath = await getAppDir()
  const fullPath = `${rootPath}/${filePath}`
  const result = await window.bridge.saveFileByBase64(fullPath, data)
  return Boolean(result)
}

export function base64ToUint8Array(base64) {
  const binaryString = atob(base64) // 使用 atob() 将 Base64 字符串解码为二进制字符串
  const len = binaryString.length // 获取二进制字符串的长度
  const bytes = new Uint8Array(len) // 创建一个长度相同的 Uint8Array
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i) // 将每个字符的 Unicode 值赋给 Uint8Array
  }
  return bytes // 返回 Uint8Array
}

export function uint8ArrayToBase64(uint8Array) {
  let binary = ''
  const len = uint8Array.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i])
  }
  return btoa(binary) // 使用 btoa 将二进制数据编码为 Base64 字符串
}
/**
 * 用于验证是否是线路层
 * @param {object} pCell
 * @returns
 */
export function checkCellLayer(pCell) {
  if (pCell.layerSort === 'BOARD' && (pCell.layerType === 'SIGNAL' || pCell.layerType === 'POWER_GROUND' || pCell.layerType === 'MIXED')) {
    // 执行相关操作
    return true
  }
  return false
}

export async function layerCountNumber() {
  const matrixDataStr = await window.bridge.getMatrix()
  let layersData = []
  if (isJSON(matrixDataStr)) {
    const matrixData = JSON.parse(matrixDataStr)
    layersData = Object.prototype.hasOwnProperty.call(matrixData, 'Layers') ? matrixData['Layers'] : []
  } else {
    layersData = []
  }

  let layerCount = 0
  layersData.forEach((pCell) => {
    if (checkCellLayer(pCell)) layerCount += 1
  })

  return layerCount
}
