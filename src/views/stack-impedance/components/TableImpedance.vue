<template>
  <div class="fieldset-replace h-full">
    <div class="nomarl-title"> 阻抗表 </div>
    <div :style="{ height: `calc(100% - ${footerHeight}px)` }">
      <vxe-grid ref="gridRef" v-bind="gridOptions" v-on="gridEvents">
        <template #input_f1="{ row }">
          <el-input v-model.number="row.requiredImpedanceValue" type="number" size="small" style="width: 100%" />
        </template>
        <template #input_f2="{ row }">
          <el-input v-model="row.signalPlane" type="text" size="small" style="width: 100%" />
        </template>
        <template #input_f3="{ row }">
          <el-input v-model="row.impedanceType" type="text" size="small" style="width: 100%" />
        </template>
        <template #input_f4="{ row }">
          <el-input v-model="row.firstReferenceLayer" type="text" size="small" style="width: 100%" />
        </template>
        <template #input_f5="{ row }">
          <el-input v-model="row.secondReferenceLayer" type="text" size="small" style="width: 100%" />
        </template>
        <template #input_p1="{ row }">
          <el-input v-model="row.lineWidth" type="text" size="small" style="width: 100%" />
        </template>
        <template #input_p2="{ row }">
          <el-input v-model="row.lineSpacing" type="text" size="small" style="width: 100%" />
        </template>
        <template #input_p3="{ row }">
          <el-input v-model="row.spurCopper" type="text" size="small" style="width: 100%" />
        </template>
      </vxe-grid>
    </div>
    <div class="flex justify-between items-center" :style="{ height: `${footerHeight}px` }">
      <div>
        <el-button :disabled="loading" type="primary" size="small" @click="addImpedance"> 添加阻抗 </el-button>
        <!-- <el-button :disabled="loading" size="small" @click="loadEcamDataAndUpdate"> 载入阻抗 </el-button> -->
        <!-- <el-button :disabled="loading" type="warning" size="small" @click="loadAIDataAndUpdate"> 载入AI阻抗 </el-button> -->
      </div>

      <!-- <div>
        <el-button :disabled="loading" type="success" size="small" @click="saveEcamImpedance"> 保存阻抗 </el-button>
      </div> -->
    </div>
  </div>
</template>

<script setup>
  import _ from 'lodash'
  import { nextTick, reactive, ref } from 'vue'
  import { onMounted } from 'vue'

  import $StackImpedance from '@/api/modules/stack-impedance.js'

  const sParams = window._globalServerParams

  const footerHeight = ref(36)

  const gridRef = ref(null)

  const tableData = ref([])
  const currentIndex = ref(-1)
  const loading = ref(false)
  const ecamData = ref([])
  const menuConfig = reactive({
    body: {
      options: [[{ code: 'del', name: '删除', visible: true, disabled: false }]],
    },
  })
  const gridOptions = reactive({
    loading: loading,
    size: 'mini',
    border: true,
    height: '100%',
    rowConfig: {
      isCurrent: true,
    },
    editConfig: {
      trigger: 'dblclick',
      mode: 'cell',
    },
    menuConfig: menuConfig,
    columns: [
      { type: 'seq', width: 50, title: ' ' },
      {
        title: '客户原稿设计',
        children: [
          { field: 'requiredImpedanceValue', title: '需求阻抗(ohm)', width: 120, editRender: {}, slots: { edit: 'input_f1' } },
          { field: 'signalPlane', title: '阻抗层', editRender: {}, slots: { edit: 'input_f2' } },
          { field: 'impedanceType', title: '阻抗模式', editRender: {}, slots: { edit: 'input_f3' } },
          { field: 'firstReferenceLayer', title: '上参考层', editRender: {}, slots: { edit: 'input_f4' } },
          { field: 'secondReferenceLayer', title: '下参考层', editRender: {}, slots: { edit: 'input_f5' } },
          { field: 'lineWidth', title: '线宽', editRender: {}, slots: { edit: 'input_p1' } },
          { field: 'lineSpacing', title: '线距', editRender: {}, slots: { edit: 'input_p2' } },
          { field: 'spurCopper', title: '到铜距离', editRender: {}, slots: { edit: 'input_p3' } },
        ],
      },
      {
        title: '阻抗线调整',
        children: [
          { field: 'param1', title: '线宽' },
          { field: 'param2', title: '线距' },
          { field: 'param3', title: '到铜距离' },
          // { field: 'param4', title: '计算结果' },
        ],
      },
    ],
    data: [
      // { id: 10001, name: 'Test1', role: 'Develop', sex: 'Man', age: 28, lineWidth: 'test abc' },
      // { id: 10002, name: 'Test2', role: 'Test', sex: 'Women', age: 22, address: 'Guangzhou' },
    ],
  })

  const gridEvents = {
    currentChange({ rowIndex }) {
      currentIndex.value = rowIndex
    },
    cellMenu({ row, rowIndex }) {
      currentIndex.value = rowIndex
      const $grid = gridRef.value
      if ($grid) {
        $grid.setCurrentRow(row)
      }
    },
    menuClick({ menu }) {
      const $grid = gridRef.value
      if ($grid) {
        switch (menu.code) {
          case 'del':
            if (currentIndex.value > -1) {
              tableData.value.splice(currentIndex.value, 1)
              gridRef.value.reloadData([])
              nextTick(() => {
                gridRef.value.reloadData(tableData.value)
                currentIndex.value = -1
              })
            }
            break
        }
      }
    },
  }

  // const initComponent = () => {
  //   $StackImpedance.impedanceEcamList({ fileId: sParams.fileid, tokenId: sParams.tokenid })
  // }
  const loadEcamData = async () => {
    const res = await $StackImpedance.impedanceEcamList({ fileId: sParams.fileid, tokenId: sParams.tokenid })
    if (res.code === 1) {
      tableData.value = res.data
      ecamData.value = _.cloneDeep(res.data)
    } else {
      tableData.value = []
    }
  }

  const loadAIData = async () => {
    const res = await $StackImpedance.impedanceAIList({ extractionId: sParams.task_id, tokenId: sParams.tokenid })
    if (res.code === 1) {
      tableData.value = res.data
    } else {
      tableData.value = []
    }
  }

  const updateTableData = (tData) => {
    gridRef.value?.reloadData([])
    nextTick(() => {
      gridRef.value?.reloadData(tData)
    })
  }

  // const loadAIDataAndUpdate = async () => {
  //   loading.value = true
  //   await loadAIData()
  //   updateTableData(tableData.value)
  //   loading.value = false
  // }

  const loadEcamDataAndUpdate = async () => {
    loading.value = true
    await loadEcamData()
    updateTableData(tableData.value)
    loading.value = false
  }

  const addImpedance = () => {
    const newData = {
      requiredImpedanceValue: '50',
      signalPlane: 'L1',
      impedanceType: '单端',
      firstReferenceLayer: '/',
      secondReferenceLayer: 'L2',
      lineWidth: '',
      lineSpacing: '/',
      spurCopper: '/',
      param1: '',
      param2: '',
      param3: '',
    }
    tableData.value.push(newData)
    updateTableData(tableData.value)
  }

  const initComponent = async () => {
    loading.value = true
    await loadEcamData()
    if (tableData.value.length === 0) await loadAIData()
    updateTableData(tableData.value)
    loading.value = false
  }

  const saveEcamImpedance = async () => {
    loading.value = true
    //之前的全部删掉 flag = 2
    ecamData.value = ecamData.value.map((item) => {
      item.flag = 2
      return item
    })
    tableData.value = tableData.value.map((item) => {
      delete item.uid
      item.flag = 1
      return item
    })

    const res = await $StackImpedance.impedanceEcamListSave({
      fileId: sParams.fileid,
      tokenId: sParams.tokenid,
      data: [...ecamData.value, ...tableData.value],
    })
    if (res.code === 1) {
      await loadEcamDataAndUpdate()
    } else {
      loading.value = false
    }

    return res
  }

  onMounted(async () => {
    await initComponent()
  })

  defineExpose({ updateTableData, initComponent, saveEcamImpedance })
</script>

<style scoped lang="scss"></style>
