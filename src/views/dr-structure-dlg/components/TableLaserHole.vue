<template>
  <div class="w-full h-full">
    <div style="padding: 5px">
      <el-button type="primary" size="small" @click="handleAdd">添加</el-button>
    </div>
    <!-- <el-button type="primary" @click="a">a</el-button> -->
    <div style="height: calc(100% - 38px)">
      <vxe-grid ref="vxeGridRef" v-bind="gridOptions">
        <template #edit_layerNumber="{ row }">
          <vxe-input v-model="row.layerNumber" clearable @change="onChange2(row)"></vxe-input>
        </template>
        <template #edit_holeNumer="{ row }">
          <vxe-input v-model.number="row.holeNumer" type="integer" clearable @change="onChange2(row)"></vxe-input>
        </template>
        <template #edit_minFinishsize="{ row }">
          <vxe-input v-model.number="row.minFinishsize" type="float" digits="3" clearable @change="onChange2(row)"></vxe-input>
        </template>

        <template #edit_layerNumber2="{ row }">
          <!-- <vxe-select v-model="row.layerNumber2" :options="layerNumber2List" @change="onChangeLayer(row)"></vxe-select> -->
          <vxe-input v-model="row.layerNumber2" clearable @change="onChange2(row)"></vxe-input>
        </template>
        <template #default_delBtn="{ rowIndex }">
          <el-button type="danger" size="small" @click="handleDel(rowIndex)">删除</el-button>
        </template>
      </vxe-grid>
    </div>
  </div>
</template>

<script setup>
  import _ from 'lodash'
  import { nextTick, onMounted, reactive, ref } from 'vue'

  import { isJSON } from '@/utils'

  // const a = () => {
  //   console.log(tableData.value)
  // }
  const vxeGridRef = ref()
  const dataList = ref([])

  const tableData = ref([])

  // const layerNumber2List = ref([])

  const currentEditRowIndex = ref(-1)
  // const layerNumber2List = computed(() => {
  //   return tableData.value.map((item, index) => {
  //     const i = { value: item.layerNumber, label: item.layerNumber, disabled: false }
  //     if (index === currentEditRowIndex.value) i.disabled = true
  //     if (_.some(tableData.value, (row) => row.layerNumber2 === i.value)) i.disabled = true
  //     return i
  //   })
  // })

  const gridOptions = reactive({
    size: 'mini',
    border: true,
    height: '100%',
    editConfig: {
      trigger: 'click',
      mode: 'row',
      beforeEditMethod({ row, column, rowIndex }) {
        if (column.field === 'layerNumber2') {
          if (_.some(tableData.value, (item) => item.layerNumber2 !== '' && item.layerNumber2 === row.layerNumber)) {
            console.log('row.layerNumber', row.layerNumber)
            return false
          }
        }
        currentEditRowIndex.value = rowIndex
        return true
      },
    },

    headerCellStyle({ columnIndex }) {
      if (columnIndex < 3) return { backgroundColor: '#FFF3CA' }
      if (columnIndex < 6) return { backgroundColor: '#FFFF00' }
      if (columnIndex < 9) return { backgroundColor: '#D2F4F2' }
    },

    cellStyle({ row, column }) {
      if (column.field === 'layerNumber2') {
        if (_.some(tableData.value, (item) => item.layerNumber2 !== '' && item.layerNumber2 === row.layerNumber)) {
          console.log('row.layerNumber', row.layerNumber)
          return {
            backgroundColor: '#ccc',
          }
        }
      }
    },
    columns: [
      { field: 'layerNumber', title: '层别', editRender: {}, slots: { edit: 'edit_layerNumber' } },
      { field: 'holeNumer', title: '孔数', editRender: {}, slots: { edit: 'edit_holeNumer' } },
      { field: 'minFinishsize', title: '最小孔径1', editRender: {}, slots: { edit: 'edit_minFinishsize' } },
      { field: 'layerNumber2', title: '对应层', editRender: {}, slots: { edit: 'edit_layerNumber2' } },
      { field: 'holeNumer2', title: '孔数' },
      { field: 'minFinishsize2', title: '最小孔径2' },
      { field: 'partNumber', title: '部件名' },
      { field: 'holeCount', title: '总孔数' },
      { field: 'minFinishsize3', title: '最小孔径' },
      { field: 'delBtn', title: '', slots: { default: 'default_delBtn' } },

      // { field: 'minDrillsize', title: '最小钻咀直径(mm)', editRender: {}, slots: { edit: 'edit_minDrillsize' } },
    ],
    data: tableData,
  })

  // const onFocusLayerNumber = (row) => {
  //   layerNumber2List
  //   _.forEach(layerNumber2List.value, (item) => {
  //     item.disabled = false
  //   })
  //   const d = _.find(layerNumber2List.value, (item) => {
  //     return item.value === row.layerNumber
  //   })
  //   if (d) d.disabled = true
  // }

  const onChange2 = (row) => {
    if (row.layerNumber) row.partNumber = `${row.layerNumber}-${row.layerNumber2}`

    const d2 = _.find(tableData.value, (item) => {
      return row.layerNumber2 === item.layerNumber
    })
    const numParse = (val) => {
      const n = Number(val)
      return isNaN(n) ? 0 : n
    }

    if (d2) {
      row.holeNumer2 = d2.holeNumer
      row.minFinishsize2 = d2.minFinishsize
      row.holeCount = numParse(row.holeNumer) + numParse(row.holeNumer2)
      row.minFinishsize3 = (() => {
        const n1 = row.minFinishsize === '' ? NaN : Number(row.minFinishsize)
        const n2 = row.minFinishsize2 === '' ? NaN : Number(row.minFinishsize2)
        if (isNaN(n1) && isNaN(n2)) return ''
        if (isNaN(n1)) return n2
        if (isNaN(n2)) return n1
        return n1 > n2 ? n2 : n1
      })()
    }
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
      layerNumber: '',
      holeNumer: '',
      minFinishsize: '',
      layerNumber2: '',
      holeNumer2: '',
      minFinishsize2: '',
      holeCount: '',
      minFinishsize3: '',
    }
    tableData.value.push(newItem)
  }

  // const onClose = async () => {
  //   const p = await window.bridge.getWindowParam('drTructureDlg')
  //   console.log(p)
  //   await window.bridge.closeWindow('drTructureDlg')
  // }

  onMounted(async () => {
    // eslint-disable-next-line no-constant-condition
    if (false) {
      const dataJSON = await window.bridge.getValue('drlInfoex')
      console.log('dataJSON', dataJSON)
      if (isJSON(dataJSON)) {
        const data = JSON.parse(dataJSON)
        dataList.value = Array.isArray(data) ? data : []
      } else {
        dataList.value = []
      }
    } else {
      dataList.value = [
        { layerNumber: 'L1', holeNumer: 3000, minFinishsize: 0.075 },
        { layerNumber: 'L2', holeNumer: 1000, minFinishsize: 0.1 },
        { layerNumber: 'L3', holeNumer: '', minFinishsize: '' },
        { layerNumber: 'L4', holeNumer: '', minFinishsize: '' },
        { layerNumber: 'L5', holeNumer: '', minFinishsize: '' },
        { layerNumber: 'L6', holeNumer: '', minFinishsize: '' },
        { layerNumber: 'L7', holeNumer: '', minFinishsize: '' },
        { layerNumber: 'L8', holeNumer: 5600, minFinishsize: '' },
      ]
    }
    const clone_data = _.cloneDeep(dataList.value)
    // layerNumber2List.value = clone_data.map((item) => {
    //   return { value: item.layerNumber, label: item.layerNumber }
    // })

    tableData.value = clone_data.map((item) => {
      const newItem = {
        ...item,
        layerNumber2: '',
        HoleNumber2: '',
        minFinishsize2: '',
        partNumber: '',
        holeCount: '',
        minFinishsize3: '',
      }
      return newItem
    })
  })
</script>

<style scoped lang="scss"></style>
