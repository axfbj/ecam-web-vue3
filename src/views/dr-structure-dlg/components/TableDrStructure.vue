<template>
  <div class="w-full h-full">
    <div style="padding: 5px">
      <el-button type="primary" size="small" @click="handleAdd">添加</el-button>
      总层数：{{ layerCount }} 顶-底：{{ topLayerNumber }}-{{ bottomLayerNumber }}
      <!-- <el-button type="primary" size="small" @click="onToggleLaserHole">激光孔统计</el-button> -->
    </div>
    <!-- <el-button type="primary" @click="a">a</el-button> -->

    <div style="height: calc(100% - 38px)">
      <vxe-grid ref="vxeGridRef" v-bind="gridOptions">
        <template #edit_startNum="{ row }">
          <vxe-input v-model="row.startNum" type="integer" clearable @change="onChangeLayer(row)"></vxe-input>
        </template>
        <template #edit_endNum="{ row }">
          <vxe-input v-model="row.endNum" type="integer" clearable @change="onChangeLayer(row)"></vxe-input>
        </template>
        <template #default_partNumber="{ row }">
          {{ row.partNumber || '1' }}
        </template>
        <template #edit_count="{ row }">
          <vxe-input v-model="row.count" type="integer" clearable></vxe-input>
        </template>
        <template #edit_type="{ row }">
          <vxe-select v-model="row.type" :options="typeList"></vxe-select>
        </template>
        <template #default_type="{ row }">
          {{ _.find(typeList, (item) => item.value === row.type)?.label || '' }}
        </template>
        <template #edit_minFinishsize="{ row }">
          <vxe-input v-model="row.minFinishsize" type="float" digits="3" clearable></vxe-input>
        </template>
        <template #edit_minDrillsize="{ row }">
          <vxe-input v-model="row.minDrillsize" type="float" digits="3" clearable></vxe-input>
        </template>
        <template #default_delBtn="{ rowIndex }">
          <el-button type="danger" size="small" @click="handleDel(rowIndex)">删除</el-button>
        </template>
      </vxe-grid>
    </div>
    <!-- <TableLaserHole /> -->
  </div>
</template>

<script setup>
  import { ElMessage } from 'element-plus'
  import _ from 'lodash'
  import { nextTick, onMounted, reactive, ref } from 'vue'

  import $DrStructureDlg from '@/api/modules/dr-structure-dlg'
  // import { isJSON } from '@/utils'
  import { layerCountNumber } from '@/utils/QTMethods.js'
  // import TableLaserHole from '@/views/dr-structure-dlg/components/TableLaserHole.vue'

  const sParams = window._globalServerParams

  const vxeGridRef = ref()
  const dataList = ref([])

  const tableData = ref([])

  const typeList = [
    { value: '通孔', label: '通孔' },
    { value: '机械盲孔', label: '机械盲孔' },
    { value: '机械埋孔', label: '机械埋孔' },
    { value: '激光孔', label: '激光孔' },
    { value: '背钻孔', label: '背钻孔' },
    { value: '控深孔', label: '控深孔' },
  ]

  const loading = ref(false)
  const gridOptions = reactive({
    loading: loading,
    size: 'mini',
    border: true,
    height: '100%',
    editConfig: {
      trigger: 'click',
      mode: 'row',
    },
    columns: [
      // { type: 'seq', width: 70 },
      { field: 'startNum', title: '开始层', editRender: {}, slots: { edit: 'edit_startNum' } },
      { field: 'endNum', title: '结束层', editRender: {}, slots: { edit: 'edit_endNum' } },
      { field: 'partNumber', title: '钻带名' },
      { field: 'type', title: '类型', editRender: {}, slots: { edit: 'edit_type', default: 'default_type' } },
      { field: 'count', title: '孔数', editRender: {}, slots: { edit: 'edit_count' } },
      { field: 'minFinishsize', title: '最小孔径(mm)', editRender: {}, slots: { edit: 'edit_minFinishsize' } },
      { field: 'minDrillsize', title: '最小钻咀直径(mm)', editRender: {}, slots: { edit: 'edit_minDrillsize' } },
      { field: 'delBtn', title: '', slots: { default: 'default_delBtn' } },
    ],
    data: tableData,
  })

  const onChangeLayer = (row) => {
    row.partNumber = `L${row.startNum}-L${row.endNum}`
  }

  const handleDel = (rowIndex) => {
    tableData.value?.splice(rowIndex, 1)
    vxeGridRef.value.reloadData([])
    nextTick(() => {
      vxeGridRef.value.reloadData(tableData.value)
    })
  }

  const handleAdd = () => {
    const newItem = {
      startNum: '',
      endNum: '',
      type: '',
      count: '',
      minFinishsize: '',
      minDrillsize: '',
    }
    tableData.value.push(newItem)
  }

  // const onToggleLaserHole = () => {
  //   console.log('onToggleLaserHole')
  // }

  // const onClose = async () => {
  //   const p = await window.bridge.getWindowParam('drTructureDlg')
  //   console.log(p)
  //   await window.bridge.closeWindow('drTructureDlg')
  // }

  const layerCount = ref(0)
  const topLayerNumber = ref(0)
  const bottomLayerNumber = ref(0)

  const drlInfoex_qt = ref([])
  const th_slot_count_qt = ref(0)

  function saveDataAddGroupSerino(originalData, typeFiled) {
    // const data = [{ type: 'A' }, { type: 'B' }, { type: 'A' }, { type: 'C' }, { type: 'B' }]

    const indexedData = originalData.map((item, index) => ({ ...item, originalIndex: index }))

    // 按 type 分组
    const groupedData = _.groupBy(indexedData, typeFiled)

    // 遍历每个组，添加递增的 serino
    let result = _.flatMap(groupedData, (items) => {
      return items.map((item, index) => {
        return { ...item, serino: index + 1 }
      })
    })

    // 根据 originalIndex 还原顺序
    result = _.sortBy(result, 'originalIndex')

    // 移除原始索引字段
    result = result.map((item) => {
      delete item.originalIndex
      return item
    })

    return result
  }

  async function getDrillDataList() {
    const res = await $DrStructureDlg.getDrillDataList({ fileId: sParams.fileid, tokenId: sParams.tokenid })
    if (res.code === 1) {
      if (res.data?.length > 0) {
        const listO = res.data.map((item) => {
          return {
            sumSerino: item['sumSerino'],
            id: item['id'],
            startNum: item['startLayer'],
            endNum: item['endLayer'],
            type: item['drillType'],
            count: item['holeNumber'],
            minFinishsize: item['minimumAperture'],
            minDrillsize: item['minimumDrillDiameter'],
            partNumber: item['drillName'],
          }
        })
        // 使用 orderBy 排序
        const list = _.orderBy(listO, [(item) => (item.sumSerino !== undefined ? item.sumSerino : null)], ['asc'])
        return list
      }
    }
    return []
  }

  async function writeDrillData() {
    const delData = _.map(
      _.filter(dataList.value, (item) => item.id),
      (item) => ({ flag: 2, id: item.id })
    )
    const saveDataO = _.map(tableData.value, (item) => {
      return {
        flag: 0,
        startLayer: item['startNum'],
        endLayer: item['endNum'],
        drillType: item['type'],
        holeNumber: item['count'],
        minimumAperture: item['minFinishsize'],
        minimumDrillDiameter: item['minDrillsize'],
        drillName: item['partNumber'],
      }
    })

    /**
     * 通孔只有：1个
       控深孔：2个
       背钻孔：2个
       盲孔：各8个
       埋孔: 8个
       激光孔：16个
       做限制
     */

    const countTotal1 = _.size(_.filter(saveDataO, (item) => item['drillType'].includes('通孔')))
    const countTotal2 = _.size(_.filter(saveDataO, (item) => item['drillType'].includes('控深孔')))
    const countTotal3 = _.size(_.filter(saveDataO, (item) => item['drillType'].includes('背钻孔')))
    const countTotal4 = _.size(_.filter(saveDataO, (item) => item['drillType'].includes('盲孔')))
    const countTotal5 = _.size(_.filter(saveDataO, (item) => item['drillType'].includes('埋孔')))
    const countTotal6 = _.size(_.filter(saveDataO, (item) => item['drillType'].includes('激光孔')))

    let msg = ''
    if (countTotal1 > 1) msg += '通孔最多只能有一个;<br/>'
    if (countTotal2 > 2) msg += '控深孔最多只能有两个;<br/>'
    if (countTotal3 > 2) msg += '背钻孔最多只能有两个;<br/>'
    if (countTotal4 > 8) msg += '盲孔最多只能有8个;<br/>'
    if (countTotal5 > 8) msg += '埋孔最多只能有8个;<br/>'
    if (countTotal6 > 16) msg += '激光孔最多只能有16个;<br/>'
    if (msg) {
      ElMessage({
        type: 'error',
        dangerouslyUseHTMLString: true,
        message: msg,
      })
      return msg
    }
    // 加上总序号 sumSerino
    const saveData = _.map(saveDataAddGroupSerino(saveDataO, 'drillType'), (item, index) => ({ ...item, sumSerino: index + 1 }))

    const params = { fileId: sParams.fileid, tokenId: sParams.tokenid, data: [...delData, ...saveData] }

    console.log('params', params)

    if (window.qt) {
      const res = await $DrStructureDlg.writeDrillData(params)
      if (res.code === 1) {
        ElMessage.success('保存成功')
      } else {
        ElMessage.error('保存失败')
      }
    }
  }

  async function initPage() {
    if (window.qt) {
      const qtDataJSON = await window.bridge.getWindowParam('drTructureDlg')
      // 出来的时候做了限制，肯定是一个json
      const qtData = JSON.parse(qtDataJSON)
      console.log('qtData', qtData)
      drlInfoex_qt.value = qtData.drlInfoex
      th_slot_count_qt.value = qtData.th_slot_count
      // 层数取
      layerCount.value = await layerCountNumber()
      if (layerCount.value > 0) {
        topLayerNumber.value = 1
        bottomLayerNumber.value = layerCount.value
      }

      // const dataJSON = drlInfoex.value

      // if (isJSON(dataJSON)) {
      //   const data = JSON.parse(dataJSON)
      //   dataList.value = Array.isArray(data) ? data : []
      // } else {
      //   dataList.value = []
      // }
    } else {
      layerCount.value = 8
      if (layerCount.value > 0) {
        topLayerNumber.value = 1
        bottomLayerNumber.value = layerCount.value
      }
      dataList.value = [
        {
          endName: 'GBL',
          endNum: 8,
          name: 'DRL',
          startName: 'GTL',
          startNum: 1,
          toolinfo: [
            {
              area: 4.1592374031247319,
              count: 4,
              drillsize: 2.30124,
              finishsize: 2.30124,
              num: 'T15',
              type: 'Plated',
            },
            {
              area: 7.9426600031524313,
              count: 2,
              drillsize: 3.1800799999999998,
              finishsize: 3.1800799999999998,
              num: 'T16',
              type: 'NPlated',
            },
          ],
        },
        {
          endName: 'L6',
          endNum: 8,
          name: 'DRL3-6',
          startName: 'L3',
          startNum: 3,
          toolinfo: [
            {
              area: 0.031623613770474804,
              count: 174,
              drillsize: 0.20066000000000001,
              finishsize: 0.20066000000000001,
              num: 'T01',
              type: 'Via',
            },
            {
              area: 0.070553949389535506,
              count: 18,
              drillsize: 0.29971999999999999,
              finishsize: 0.29971999999999999,
              num: 'T02',
              type: 'Via',
            },
          ],
        },
        {
          endName: 'L2',
          endNum: 8,
          name: 'DRL1-2',
          startName: 'GTL',
          startNum: 1,
          toolinfo: [
            {
              area: 0.031623613770474804,
              count: 891,
              drillsize: 0.20066000000000001,
              finishsize: 0.20066000000000001,
              num: 'T01',
              type: 'Via',
            },
          ],
        },
        {
          endName: 'L3',
          endNum: 8,
          name: 'DRL2-3',
          startName: 'L2',
          startNum: 2,
          toolinfo: [
            {
              area: 0.031623613770474804,
              count: 574,
              drillsize: 0.20066000000000001,
              finishsize: 0.20066000000000001,
              num: 'T01',
              type: 'Via',
            },
          ],
        },
        {
          endName: 'L7',
          endNum: 8,
          name: 'DRL6-7',
          startName: 'L6',
          startNum: 6,
          toolinfo: [
            {
              area: 0.031623613770474804,
              count: 45,
              drillsize: 0.20066000000000001,
              finishsize: 0.20066000000000001,
              num: 'T01',
              type: 'Via',
            },
            {
              area: 0.070553949389535506,
              count: 124,
              drillsize: 0.29971999999999999,
              finishsize: 0.29971999999999999,
              num: 'T02',
              type: 'Via',
            },
          ],
        },
        {
          endName: 'GBL',
          endNum: 8,
          name: 'DRL7-8',
          startName: 'L7',
          startNum: 7,
          toolinfo: [
            {
              area: 0.031623613770474804,
              count: 47,
              drillsize: 0.20066000000000001,
              finishsize: 0.20066000000000001,
              num: 'T01',
              type: 'Via',
            },
            {
              area: 0.070553949389535506,
              count: 118,
              drillsize: 0.29971999999999999,
              finishsize: 0.29971999999999999,
              num: 'T02',
              type: 'Via',
            },
          ],
        },
        {
          endName: 'GBL',
          endNum: 8,
          name: 'DRL+1',
          startName: 'GTL',
          startNum: 1,
          toolinfo: [
            {
              area: 0.031623613770474804,
              count: 65,
              drillsize: 0.20066000000000001,
              finishsize: 0.20066000000000001,
              num: 'T01',
              type: 'Via',
            },
            {
              area: 0.070553949389535506,
              count: 1971,
              drillsize: 0.29971999999999999,
              finishsize: 0.29971999999999999,
              num: 'T02',
              type: 'Via',
            },
            {
              area: 0.62071666189443409,
              count: 8,
              drillsize: 0.88900000000000001,
              finishsize: 0.88900000000000001,
              num: 'T03',
              type: 'Plated',
            },
            {
              area: 0.66400974890852438,
              count: 8,
              drillsize: 0.91948000000000008,
              finishsize: 0.91948000000000008,
              num: 'T04',
              type: 'Plated',
            },
            {
              area: 0.7865924222517906,
              count: 21,
              drillsize: 1.0007599999999999,
              finishsize: 1.0007599999999999,
              num: 'T05',
              type: 'Plated',
            },
            {
              area: 0.81885955452071935,
              count: 4,
              drillsize: 1.02108,
              finishsize: 1.02108,
              num: 'T06',
              type: 'Plated',
            },
            {
              area: 0.86428588002181017,
              count: 27,
              drillsize: 1.0490200000000001,
              finishsize: 1.0490200000000001,
              num: 'T07',
              type: 'Plated',
            },
            {
              area: 0.95002078548510627,
              count: 21,
              drillsize: 1.0998199999999998,
              finishsize: 1.0998199999999998,
              num: 'T08',
              type: 'Plated',
            },
            {
              area: 1.1288631902325681,
              count: 33,
              drillsize: 1.1988799999999999,
              finishsize: 1.1988799999999999,
              num: 'T09',
              type: 'Plated',
            },
            {
              area: 1.4287174751380944,
              count: 2,
              drillsize: 1.34874,
              finishsize: 1.34874,
              num: 'T10',
              type: 'Plated',
            },
            {
              area: 1.7698329500665293,
              count: 13,
              drillsize: 1.5011399999999999,
              finishsize: 1.5011399999999999,
              num: 'T11',
              type: 'Plated',
            },
            {
              area: 2.0111219845379664,
              count: 40,
              drillsize: 1.6001999999999998,
              finishsize: 1.6001999999999998,
              num: 'T12',
              type: 'Plated',
            },
            {
              area: 2.0884658141474075,
              count: 2,
              drillsize: 1.6306799999999997,
              finishsize: 1.6306799999999997,
              num: 'T13',
              type: 'Plated',
            },
            {
              area: 7.067358302535041,
              count: 11,
              drillsize: 2.9997399999999996,
              finishsize: 2.9997399999999996,
              num: 'T14',
              type: 'Plated',
            },
          ],
        },
      ]
    }

    tableData.value = await (async () => {
      // 这里直接给数组
      if (window.qt) {
        loading.value = true
        const drillDataList = await getDrillDataList()
        loading.value = false
        if (drillDataList?.length > 0) {
          dataList.value = drillDataList
          console.log('drillDataList', drillDataList)
          return _.cloneDeep(drillDataList)
        }
        // 只要走到下面 就取drlInfoex_qt 的值，一定是数组，已在QML处理好
        dataList.value = drlInfoex_qt.value
      }

      const newTableData = _.cloneDeep(dataList.value).map((item) => {
        const toolInfo = item.toolinfo

        // 2024-9-11 更新 去数字就行了
        const startNum = item.startNum
        const endNum = item.endNum

        const type = (() => {
          let t = ''
          if (startNum === topLayerNumber.value && endNum === bottomLayerNumber.value) {
            t = '通孔'
            return t
          }
          if (startNum === topLayerNumber.value || endNum === bottomLayerNumber.value) {
            t = '机械盲孔'
          }
          if (startNum !== topLayerNumber.value && endNum !== bottomLayerNumber.value) {
            t = '机械埋孔'
          }
          const maxFinishsizeData = _.maxBy(toolInfo, 'finishsize')
          // 不能=0.15，必须是<0.15mm
          if (maxFinishsizeData['finishsize'] < 0.15) {
            t = '激光孔'
          }

          return t
        })()

        const minFinishsize = (() => {
          const minFinishsizeData = _.minBy(toolInfo, 'finishsize')
          return Number(minFinishsizeData['finishsize'].toFixed(3))
        })()

        const minDrillsize = (() => {
          const minDrillsizeData = _.minBy(toolInfo, 'drillsize')
          return Number(minDrillsizeData['drillsize'].toFixed(3))
        })()

        const count = _.sumBy(toolInfo, function (o) {
          return Number(o.count)
        })

        // 部件名
        const partNumber = `L${startNum}-L${endNum}`

        const newItem = {
          startNum,
          endNum,
          type,
          count,
          minFinishsize,
          minDrillsize,
          partNumber,
        }
        return newItem
      })
      // 过滤出通孔
      const findFirstIndex = newTableData.findIndex((item) => item.type === '通孔')

      if (findFirstIndex > -1) {
        const filterData = newTableData.filter((item) => item.type === '通孔')
        const filterDataCount = _.sumBy(filterData, function (o) {
          return Number(o.count)
        })
        const clone_first = _.cloneDeep(filterData[0])
        // const th_slot_count = window.qt ? await window.bridge.getValue('th_slot_count') : 0
        // 获取槽孔
        const th_slot_count = th_slot_count_qt.value
        clone_first.count = filterDataCount - (Number(th_slot_count) || 0)
        newTableData[findFirstIndex] = clone_first
        _.remove(newTableData, (item, index) => index !== findFirstIndex && item.type === '通孔')
      }

      return newTableData
    })()
  }

  onMounted(async () => {
    await initPage()
  })

  defineExpose({
    initPage,
    writeDrillData,
  })
</script>

<style scoped lang="scss"></style>
