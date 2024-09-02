import http from '@/api/http'

export default {
  /**
   * 载入AI叠层
   * @param {Object} data
   * @param {string} data.extractionId ai提取任务id
   * @param {string} data.tokenId 企业id
   * @returns {Promise}
   */
  stackAIList(data) {
    return http.post('/emake/loadAiCalleniaInfo', data)
  },
  /**
   * 获取ecam阻抗
   * @param {Object} data
   * @param {string} data.fileId 文件id
   * @param {string} data.tokenId 企业id
   * @returns {Promise}
   */
  stackEcamList(data) {
    return http.post('/emake/queryEcamCalleniaInfo', data)
  },

  /**
   * 保存叠层
   * @param {Object} data
   * @param {string} data.fileId 文件id
   * @param {string} data.tokenId 企业id
   * @param {Array<Object>} data.data 阻抗数据 （flag:1:新增；2：删除；3：修改）
   * @returns {Promise}
   */
  stackEcamListSave(data) {
    return http.post('/emake/saveEcamCalleniaInfo', data)
  },

  /**
   * 载入AI阻抗
   * @param {Object} data
   * @param {string} data.extractionId ai提取任务id
   * @param {string} data.tokenId 企业id
   * @returns {Promise}
   */
  impedanceAIList(data) {
    return http.post('/emake/loadAiImpedanceInfo', data)
  },
  /**
   * 获取ecam阻抗
   * @param {Object} data
   * @param {string} data.fileId 文件id
   * @param {string} data.tokenId 企业id
   * @returns {Promise}
   */
  impedanceEcamList(data) {
    return http.post('/emake/queryEcamImpedanceInfo', data)
  },

  /**
   * 保存阻抗
   * @param {Object} data
   * @param {string} data.fileId 文件id
   * @param {string} data.tokenId 企业id
   * @param {Array<Object>} data.data 阻抗数据 （flag:1:新增；2：删除；3：修改）
   * @returns {Promise}
   */
  impedanceEcamListSave(data) {
    return http.post('/emake/saveEcamImpedanceInfo', data)
  },
}
