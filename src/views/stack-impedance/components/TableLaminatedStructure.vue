<template>
  <div id="table_laminated_structure" class="fieldset-replace h-full">
    <div class="nomarl-title">压合结构</div>
    <div :style="{ height: `calc(100% - ${footerHeight}px)` }">
      <vxe-grid ref="gridRef" v-bind="gridOptions" v-on="gridEvents">
        <template #drag_icon>
          <div class="flex justify-center items-center">
            <el-icon class="handle cursor-move" size="20"><Grid /></el-icon>
          </div>
        </template>
        <template #type_format="{ row }">
          <span>{{ materialTypeList[`${row.materialType}`] }}</span>
        </template>
        <template #obj_rect="{ row }">
          <ObjRect :material-type="row.materialType" :text="row.label" />
        </template>
        <template #edit_rate_input="{ row }">
          <div v-if="row.materialType === 'core'" class="edit-rate">
            {{ row.residual_copper_rate_t }}/{{ row.residual_copper_rate_b }}
            <div class="edit-rate-input" style="width: 110px; height: 56px; padding: 2px">
              <div class="flex justify-start" style="margin-bottom: 2px">
                <span>{{ (row.layer || '').split('/')[0] }}:</span>
                <el-input
                  v-model="row.residual_copper_rate_t"
                  style="width: 80px"
                  type="text"
                  size="small"
                  @input="onEditRateInput_type1(row, $event)"
                />
              </div>
              <div class="flex justify-start">
                <span>{{ (row.layer || '').split('/')[1] }}:</span>
                <el-input
                  v-model="row.residual_copper_rate_b"
                  style="width: 80px"
                  type="text"
                  size="small"
                  @input="onEditRateInput_type1(row, $event)"
                />
              </div>
            </div>
          </div>
          <div v-else-if="row.materialType === 'Copper'" class="edit-rate">
            {{ row.residual_copper_rate }}
            <div class="edit-rate-input" style="width: 110px; height: 30px; padding: 2px">
              <div class="flex justify-start" style="margin-bottom: 2px">
                <span>{{ row.layer }}:</span>
                <el-input v-model="row.residual_copper_rate" style="width: 80px" type="text" size="small" @change="onEditRateInput(row, $event)" />
              </div>
            </div>
          </div>
          <span v-else> {{ row.residual_copper_rate }} </span>
        </template>
      </vxe-grid>
    </div>
    <div class="flex justify-between items-center" :style="{ height: `${footerHeight}px` }">
      <div class="flex justify-start items-center">
        <div>
          <el-button type="primary" size="small" @click="onSaveLaminatedStructure"> 保存方案 </el-button>
        </div>
        <div class="footer-info flex justify-between items-center">
          <div>
            <span>压合厚度: </span><span>{{ `${laminationThickness}mm` }} </span>
          </div>
          <div>
            <span>完成板厚: </span><span>{{ `${thickness.toFixed(4)}mm` }} </span>
          </div>
        </div>
      </div>
      <div>
        <el-button type="danger" size="small" @click="onDeletePlan">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
    <DialogDataSource ref="dialogDataSourceRef" @confirm="onDataSourceAdd" />
  </div>
</template>

<script setup>
  import { ElMessage } from 'element-plus'
  import _ from 'lodash'
  import Sortable from 'sortablejs'
  import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'

  import $StackImpedance from '@/api/modules/stack-impedance'
  import { isJSON } from '@/utils'
  import { readFile, saveFile } from '@/utils/QTMethods'
  import DialogDataSource from '@/views/stack-impedance/components/DialogDataSource.vue'
  import ObjRect from '@/views/stack-impedance/components/ObjRect.vue'
  import useTableDataSource from '@/views/stack-impedance/hooks/useTableDataSource'

  const sParams = window._globalServerParams

  const { copperFoilThickness } = useTableDataSource()

  const props = defineProps({
    structuralPlan: {
      type: String,
      default: '',
    },
    innerLayerCopperThickness: {
      type: String,
      default: '',
    },
    thickness: {
      type: Number,
      default: 1,
    },
    layer: {
      type: [Number, null],
      default: null,
    },
  })
  const emit = defineEmits(['update-layer-count'])
  // import useTableDataSource from '@/views/stack-impedance/hooks/useTableDataSource.js'

  // const { copperFoilThickness } = useTableDataSource()
  const footerHeight = ref(36)
  const gridRef = ref(null)
  const dialogDataSourceRef = ref()
  const ecamData = ref([])
  const loading = ref(false)
  const emptyRowData = {
    layerId: '',
    gerberName: '',
    gerberLayerAttribute: '',
    materialType: '',
    materialBrand: '',
    materialModel: '',
    signalLayerName: '',
    dielectricConstant: '',
    materialThickness: '',
    materialFinalThickness: '',
    copperFoilWeight: '',
    thicknessTorlerance: '',
    sort: 0,
    materialSpecifications: '',
    numberOfMaterialSheets: '',
    otherNotes: '',
  }
  const materialTypeList = {
    core: '芯板',
    bare_core: '光板',
    Prepreg: 'PP',
    Copper: '铜箔',
  }
  const currentIndex = ref(-1)
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
          case 'add':
            dialogDataSourceRef.value?.toggleDialog(true, menu.code)
            break
          case 'replace':
            if (currentIndex.value > -1) {
              dialogDataSourceRef.value?.toggleDialog(true, menu.code)
            }
            break
          case 'del':
            if (currentIndex.value > -1) {
              tableData.value.splice(currentIndex.value, 1)
              tableData.value = tableDataFormt(tableData.value)
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
  const menuConfig = reactive({
    body: {
      options: [
        [
          { code: 'add', name: '添加', visible: true, disabled: false },
          { code: 'replace', name: '替换', visible: true, disabled: false },
          { code: 'del', name: '删除', visible: true, disabled: false },
        ],
      ],
    },
  })

  const tableData = ref([])

  const laminationThickness = computed(() => {
    let laminationT_thickness = 0
    tableData.value.forEach((item) => {
      laminationT_thickness += Number(item.materialFinalThickness || 0)
    })
    return laminationT_thickness.toFixed(4)
  })

  const layerCount = computed(() => {
    let layer_count = 0
    tableData.value.forEach((item) => {
      if (item.materialType === 'core') {
        layer_count += 2
      }
      if (item.materialType === 'Copper') {
        layer_count += 1
      }
    })
    return layer_count
  })

  watch(
    () => layerCount.value,
    (newVal, oldVal) => {
      if (newVal !== oldVal && tableData.value.length > 0) {
        emit('update-layer-count', newVal)
      }
    }
  )

  const formatLayerData = (tData) => {
    const _tData = _.cloneDeep(tData)
    let flagNumber = 0
    return _tData.map((item) => {
      if (item.materialType === 'core') {
        item.layer = `L${flagNumber + 1}/L${flagNumber + 2}`
        flagNumber += 2
      } else if (item.materialType === 'Copper') {
        item.layer = `L${flagNumber + 1}`
        flagNumber += 1
      } else {
        item.layer = ''
      }
      return item
    })
  }

  const calcPPLaminationThickness = (_tData) => {
    // 找到最上面 芯板版的索引
    const fristCoreIndex = _.findIndex(_tData, (_item) => _item.materialType === 'core')
    // 找到最后面 芯板的索引
    const lastCoreIndex = _.findLastIndex(_tData, (_item) => _item.materialType === 'core')

    return _tData.map((item, index) => {
      // pp压合厚度计算
      if (item.materialType === 'Prepreg') {
        const prvIndex = index - 1
        const nextIndex = index + 1
        let prvItem = null
        let nextItem = null
        item.materialFinalThickness = item.materialThickness
        if ((fristCoreIndex > -1 && index < fristCoreIndex) || (index > fristCoreIndex && index < lastCoreIndex)) {
          nextItem = _tData[nextIndex]
          if (nextItem.materialType === 'core') {
            var rate3 = Number(nextItem.residual_copper_rate_t) / 100
            item.materialFinalThickness = Number(item.materialFinalThickness) - (1 - rate3) * Number(nextItem.residual_copper_rate_number_t)
            item.materialFinalThickness = Number(item.materialFinalThickness.toFixed(4))
          } else if (nextItem.materialType === 'Copper') {
            var rate4 = Number(nextItem.residual_copper_rate) / 100
            item.materialFinalThickness = Number(item.materialFinalThickness) - (1 - rate4) * Number(nextItem.residual_copper_rate_number)
            item.materialFinalThickness = Number(item.materialFinalThickness.toFixed(4))
          }
        }

        if ((lastCoreIndex > -1 && index > lastCoreIndex) || (index > fristCoreIndex && index < lastCoreIndex)) {
          prvItem = _tData[prvIndex]
          if (prvItem.materialType === 'core') {
            var rate1 = Number(prvItem.residual_copper_rate_b) / 100
            item.materialFinalThickness = Number(item.materialFinalThickness) - (1 - rate1) * Number(prvItem.residual_copper_rate_number_b)
            item.materialFinalThickness = Number(item.materialFinalThickness.toFixed(4))
          } else if (prvItem.materialType === 'Copper') {
            var rate2 = Number(prvItem.residual_copper_rate) / 100
            item.materialFinalThickness = Number(item.materialFinalThickness) - (1 - rate2) * Number(prvItem.residual_copper_rate_number)
            item.materialFinalThickness = Number(item.materialFinalThickness.toFixed(4))
          }
        }
      }

      return item
    })
  }

  const tableDataFormt = (tData) => {
    const _tData = formatLayerData(tData)
    return calcPPLaminationThickness(_tData)
  }

  const rowClassName = ({ rowIndex }) => {
    return `drag-row-${rowIndex}`
  }
  const cellClassName = ({ column, rowIndex, columnIndex }) => {
    if (columnIndex === 0) return `drag-icon-${rowIndex}`
    if (column.property === 'obj') return 'obj-cell-class'

    return ''
  }

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
    rowClassName: rowClassName,
    cellClassName: cellClassName,
    columns: [
      // { type: 'seq', width: 70 },
      { field: 'darg', title: '', align: 'center', minWidth: 40, slots: { default: 'drag_icon' } },
      { field: 'layer', title: '层别', minWidth: 60 },
      { field: 'obj', title: '物件', minWidth: 160, align: 'center', slots: { default: 'obj_rect' } },
      { field: 'materialType', title: '类型', minWidth: 80, slots: { default: 'type_format' } },
      { field: 'materialSpecifications', title: '规格', minWidth: 60 },
      { field: 'materialThickness', title: '理论厚度', minWidth: 80 },
      { field: 'residual_copper_rate', title: '残铜率(%)', minWidth: 80, editRender: {}, slots: { edit: 'edit_rate_input' } },
      { field: 'materialFinalThickness', title: '压合厚度', minWidth: 80 },
    ],
    data: tableData,
  })

  const onDataSourceAdd = ({ dataItem, activeMode }) => {
    if (activeMode === 'add') {
      if (currentIndex.value > -1) {
        tableData.value.splice(currentIndex.value + 1, 0, dataItem)
      } else {
        tableData.value.push(dataItem)
      }
    }
    if (activeMode === 'replace') {
      if (currentIndex.value > -1) {
        tableData.value.splice(currentIndex.value, 1, dataItem)
      }
    }

    const currrentRow = gridRef.value.getCurrentRecord()
    tableData.value = tableDataFormt(tableData.value)
    gridRef.value.reloadData([])
    nextTick(() => {
      gridRef.value.reloadData(tableData.value)
      gridRef.value.setCurrentRow(currrentRow)
      console.log(tableData.value)
    })
  }

  const onEditRateInput_type1 = (row) => {
    row.residual_copper_rate = `${row.residual_copper_rate_t}/${row.residual_copper_rate_b}`

    gridRef.value.reloadData(calcPPLaminationThickness(tableData.value))
  }

  const onEditRateInput = () => {
    gridRef.value.reloadData(calcPPLaminationThickness(tableData.value))
  }

  const createTableSort = () => {
    const moveElement = (array, fromIndex, toIndex) => {
      // 获取要移动的元素
      const [element] = _.pullAt(array, fromIndex)

      // 将元素插入到指定位置
      array.splice(toIndex, 0, element)

      return array
    }

    const el = document.querySelector('#table_laminated_structure .body--wrapper > .vxe-table--body tbody')

    let dargIndex = null
    let exchangeIndex = null
    new Sortable(el, {
      handle: '.handle', // handle's class
      animation: 150,
      onStart: (...args) => {
        dargIndex = args[0].item.className.match(/drag-row-(\d+)/)[1]
        // console.log('onStart', args, dargIndex)
      },
      onMove: (...args) => {
        exchangeIndex = args[0].related.className.match(/drag-row-(\d+)/)[1]
        // console.log('onMove', args, exchangeIndex)
      },
      onUpdate: () => {
        const dargIdx = dargIndex
        const exchangeIdx = exchangeIndex
        tableData.value = moveElement(tableData.value, dargIdx, exchangeIdx)

        const currrentRow = gridRef.value.getCurrentRecord()
        tableData.value = tableDataFormt(tableData.value)
        gridRef.value.reloadData([])
        nextTick(() => {
          gridRef.value.reloadData(tableData.value)
          gridRef.value.setCurrentRow(currrentRow)
        })
      },
      onEnd: () => {
        dargIndex = null
        exchangeIndex = null
      },
    })
  }

  // const saveBeforeFomartTableData = (tableData) => {
  //   return _.cloneDeep(tableData).map((item) => {
  //     return {
  //       ...item,
  //       signalLayerName: JSON.stringify({
  //         label: item.label,
  //         layer: item.layer,
  //         residual_copper_rate_flag: item.residual_copper_rate_flag,
  //         residual_copper_rate: item.residual_copper_rate,
  //       }),
  //     }
  //   })
  // }

  const onSaveLaminatedStructure = async () => {
    const stackImpedanceJsonPath = 'localStorageFiles/stackImpedance.json'
    const _tableData = _.cloneDeep(tableData.value).map((item, index) => {
      return {
        ..._.cloneDeep(emptyRowData),
        ...item,
        sort: index,
        signalLayerName: JSON.stringify({
          label: item.label,
          layer: item.layer,
          residual_copper_rate_flag: item.residual_copper_rate_flag,
          residual_copper_rate: item.residual_copper_rate,
        }),
      }
    })
    const laminatedStructureTmp = await (async () => {
      if (window.qt) return await readFile(stackImpedanceJsonPath)
      else return JSON.parse(localStorage.getItem('laminatedStructureTmp')) || {}
    })()
    if (!_.isObject(laminatedStructureTmp[`layer_${props.layer}`])) laminatedStructureTmp[`layer_${props.layer}`] = {}
    if (_tableData.length > 0) {
      laminatedStructureTmp[`layer_${props.layer}`][`plan_${props.structuralPlan}_p1_${props.thickness}_p2${props.innerLayerCopperThickness}`] = {
        layer: props.layer,
        structuralPlan: props.structuralPlan,
        innerLayerCopperThickness: props.innerLayerCopperThickness,
        tableData: _tableData,
      }
    }

    if (window.qt) {
      await saveFile(laminatedStructureTmp, stackImpedanceJsonPath)
    } else {
      localStorage.setItem('laminatedStructureTmp', JSON.stringify(laminatedStructureTmp))
    }

    ElMessage.success('压合结构方案保存成功！')
  }

  const onDeletePlan = async () => {
    const stackImpedanceJsonPath = 'localStorageFiles/stackImpedance.json'
    const laminatedStructureTmp = await (async () => {
      if (window.qt) return await readFile(stackImpedanceJsonPath)
      else return JSON.parse(localStorage.getItem('laminatedStructureTmp')) || {}
    })()
    if (_.isObject(laminatedStructureTmp[`layer_${props.layer}`])) {
      delete laminatedStructureTmp[`layer_${props.layer}`][`plan_${props.structuralPlan}_p1_${props.thickness}_p2${props.innerLayerCopperThickness}`]
    }

    if (Object.keys(laminatedStructureTmp[`layer_${props.layer}`]).length === 0) delete laminatedStructureTmp[`layer_${props.layer}`]

    if (window.qt) {
      await saveFile(laminatedStructureTmp, stackImpedanceJsonPath)
    } else {
      localStorage.setItem('laminatedStructureTmp', JSON.stringify(laminatedStructureTmp))
    }
    ElMessage.info('压合结构方案删除成功！')
  }

  const initFormatTableData = (tableData) => {
    return tableData.map((item) => {
      if (!isJSON(item.signalLayerName)) return item
      const signalLayerName = JSON.parse(item.signalLayerName)
      item.label = signalLayerName.label
      item.layer = signalLayerName.layer
      item.residual_copper_rate_flag = signalLayerName.residual_copper_rate_flag
      item.residual_copper_rate = signalLayerName.residual_copper_rate
      if (item.materialType === 'core') {
        const residual_copper_rate_flag = (item.residual_copper_rate_flag || '').split('/')
        const residual_copper_rate = (item.residual_copper_rate || '').split('/')

        item.residual_copper_rate_t = residual_copper_rate[0] || '0'
        item.residual_copper_rate_b = residual_copper_rate[1] || '0'

        item.residual_copper_rate_number_t = copperFoilThickness[`p_${residual_copper_rate_flag[0]}`]['厚度_mm']
        item.residual_copper_rate_number_b = copperFoilThickness[`p_${residual_copper_rate_flag[1]}`]['厚度_mm']
      }

      if (item.materialType === 'Copper') {
        const residual_copper_rate_flag = item.residual_copper_rate_flag || ''
        item.residual_copper_rate_number = copperFoilThickness[`p_${residual_copper_rate_flag}`]['厚度_mm']
      }

      return item
    })
  }

  const loadEcamData = async () => {
    const res = await $StackImpedance.stackEcamList({ fileId: sParams.fileid, tokenId: sParams.tokenid })
    if (res.code === 1) {
      tableData.value = _.sortBy(res.data, ['sort'])
      ecamData.value = _.cloneDeep(tableData.value)
    } else {
      tableData.value = []
    }
  }

  const loadAIData = async () => {
    const res = await $StackImpedance.stackAIList({ extractionId: sParams.task_id, tokenId: sParams.tokenid })
    if (res.code === 1) {
      tableData.value = _.sortBy(res.data, ['sort'])
    } else {
      tableData.value = []
    }
  }

  const loadEcamDataAndUpdate = async () => {
    loading.value = true
    await loadEcamData()
    updateTableData(tableData.value)
    loading.value = false
  }

  const saveEcamLaminatedStructure = async () => {
    loading.value = true
    //之前的全部删掉 flag = 2
    ecamData.value = ecamData.value.map((item) => {
      item.flag = 2
      return item
    })
    const _tableData = _.cloneDeep(tableData.value).map((item, index) => {
      delete item.uid
      item.flag = 1
      return {
        ..._.cloneDeep(emptyRowData),
        ...item,
        sort: index,
        signalLayerName: JSON.stringify({
          label: item.label,
          layer: item.layer,
          residual_copper_rate_flag: item.residual_copper_rate_flag,
          residual_copper_rate: item.residual_copper_rate,
        }),
      }
    })

    const res = await $StackImpedance.stackEcamListSave({
      fileId: sParams.fileid,
      tokenId: sParams.tokenid,
      data: [...ecamData.value, ..._tableData],
    })
    if (res.code === 1) {
      await loadEcamDataAndUpdate()
    } else {
      loading.value = false
    }
  }

  const initComponent = async () => {
    loading.value = true
    await loadEcamData()
    if (tableData.value.length === 0) await loadAIData()
    updateTableData(tableData.value)
    loading.value = false
  }

  const updateTableData = (_tableData) => {
    tableData.value = initFormatTableData(_tableData)
    gridRef.value.reloadData([])
    nextTick(() => {
      gridRef.value.reloadData(tableData.value)
    })
  }

  onMounted(async () => {
    createTableSort()
    await initComponent()
  })

  defineExpose({ updateTableData, initComponent, saveEcamLaminatedStructure })
</script>

<style scoped lang="scss">
  #table_laminated_structure {
    :deep(.obj-cell-class) {
      padding: 2px 0;
      .vxe-cell {
        padding: 0 2px;
      }
    }
    :deep([class*='drag-icon-']) {
      padding: 0 2px;
      .vxe-cell {
        padding: 0 2px;
      }
    }
  }
  .edit-rate {
    position: relative;
    top: 0;
    left: 0;
    z-index: 1;
    .edit-rate-input {
      z-index: 2;
      width: 100px;
      height: 100%;
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      background-color: #ccc;
      border: 1px solid #ccc;
    }
  }
  .footer-info {
    font-size: 12px;
    > div {
      margin-left: 10px;
    }
  }
</style>
