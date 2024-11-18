import http from '@/api/http'

export default {
  /**
   * 钻孔列表
   * @param {Object} data
   * @param {string} data.fileId 文件id
   * @param {string} data.tokenId 企业id
   * @returns {Promise}
   */
  getDrillDataList(data) {
    return http.post('/emake/getDrillData', data)
  },

  /**
   * 回写钻孔（保存）
   * @param {Object} data
   * @param {string} data.fileId 文件id
   * @param {string} data.tokenId 企业id
   * @param {Array<Object>} data.data 钻孔数据 （flag:0:新增；1：修改；2：删除；）
   * @returns {Promise}
   */
  writeDrillData(data) {
    return http.post('/emake/writeDrillData', data)
  },
}
