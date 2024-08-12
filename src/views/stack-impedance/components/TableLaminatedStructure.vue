<template>
  <div id="table_laminated_structure" class="fieldset-replace h-full">
    <div class="nomarl-title">压合结构</div>
    <vxe-grid ref="gridRef" v-bind="gridOptions" v-on="gridEvents">
      <template #drag_icon>
        <div class="flex justify-center items-center">
          <el-icon class="handle cursor-move" size="20"><Grid /></el-icon>
        </div>
      </template>
      <template #type_format="{ row }">
        <span>{{ typeList[`t${row.type}`] }}</span>
      </template>
      <template #obj_rect="{ row }">
        <ObjRect :type="row.type" :text="row.label" />
      </template>
      <template #edit_rate_input="{ row }">
        <div v-if="row.type === '1'" class="edit-rate">
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
        <div v-else-if="row.type === '4'" class="edit-rate">
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
    <DialogDataSource ref="dialogDataSourceRef" @confirm="onDataSourceAdd" />
  </div>
</template>

<script setup>
  import _ from 'lodash'
  import Sortable from 'sortablejs'
  import { nextTick, onMounted, reactive, ref } from 'vue'

  import DialogDataSource from '@/views/stack-impedance/components/DialogDataSource.vue'
  import ObjRect from '@/views/stack-impedance/components/ObjRect.vue'
  // import useTableDataSource from '@/views/stack-impedance/hooks/useTableDataSource.js'

  // const { copperFoilThickness } = useTableDataSource()
  const gridRef = ref(null)
  const dialogDataSourceRef = ref()
  const typeList = {
    t1: '芯板',
    t2: '光板',
    t3: 'PP',
    t4: '铜箔',
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

  const formatLayerData = (tData) => {
    const _tData = _.cloneDeep(tData)
    let flagNumber = 0
    return _tData.map((item) => {
      if (item.type === '1') {
        item.layer = `L${flagNumber + 1}/L${flagNumber + 2}`
        flagNumber += 2
      } else if (item.type === '4') {
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
    const fristCoreIndex = _.findIndex(_tData, (_item) => _item.type === '1')
    // 找到最后面 芯板的索引
    const lastCoreIndex = _.findLastIndex(_tData, (_item) => _item.type === '1')

    return _tData.map((item, index) => {
      // pp压合厚度计算
      if (item.type === '3') {
        const prvIndex = index - 1
        const nextIndex = index + 1
        let prvItem = null
        let nextItem = null
        item.lamination_thickness = item.thickness
        if ((fristCoreIndex > -1 && index < fristCoreIndex) || (index > fristCoreIndex && index < lastCoreIndex)) {
          nextItem = _tData[nextIndex]
          if (nextItem.type === '1') {
            var rate3 = Number(nextItem.residual_copper_rate_t) / 100
            item.lamination_thickness = Number(item.lamination_thickness) - (1 - rate3) * Number(nextItem.residual_copper_rate_number_t)
            item.lamination_thickness = Number(item.lamination_thickness.toFixed(4))
          } else if (nextItem.type === '4') {
            var rate4 = Number(nextItem.residual_copper_rate) / 100
            item.lamination_thickness = Number(item.lamination_thickness) - (1 - rate4) * Number(nextItem.residual_copper_rate_number)
            item.lamination_thickness = Number(item.lamination_thickness.toFixed(4))
          }
        }

        if ((lastCoreIndex > -1 && index > lastCoreIndex) || (index > fristCoreIndex && index < lastCoreIndex)) {
          prvItem = _tData[prvIndex]
          if (prvItem.type === '1') {
            var rate1 = Number(prvItem.residual_copper_rate_b) / 100
            item.lamination_thickness = Number(item.lamination_thickness) - (1 - rate1) * Number(prvItem.residual_copper_rate_number_b)
            item.lamination_thickness = Number(item.lamination_thickness.toFixed(4))
          } else if (prvItem.type === '4') {
            var rate2 = Number(prvItem.residual_copper_rate) / 100
            item.lamination_thickness = Number(item.lamination_thickness) - (1 - rate2) * Number(prvItem.residual_copper_rate_number)
            item.lamination_thickness = Number(item.lamination_thickness.toFixed(4))
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

  // [
  //   {
  //     layer: 'L1',
  //     obj: 'Test1',
  //     type: '1',
  //     specification: 'Man',
  //     thickness: 28,
  //     residual_copper_rate: 'test abc',
  //     lamination_thickness: 'test def',
  //   },
  //   {
  //     layer: 'L2',
  //     obj: 'Test1',
  //     type: '2',
  //     specification: 'Man',
  //     thickness: 28,
  //     residual_copper_rate: 'test abc',
  //     lamination_thickness: 'test def',
  //   },
  //   {
  //     layer: 'L3',
  //     obj: 'Test1',
  //     type: '3',
  //     specification: 'Man',
  //     thickness: 28,
  //     residual_copper_rate: 'test abc',
  //     lamination_thickness: 'test def',
  //   },
  //   {
  //     layer: 'L4',
  //     obj: 'Test1',
  //     type: '4',
  //     specification: 'Man',
  //     thickness: 28,
  //     residual_copper_rate: 'test abc',
  //     lamination_thickness: 'test def',
  //   },
  // ]

  const rowClassName = ({ rowIndex }) => {
    return `drag-row-${rowIndex}`
  }
  const cellClassName = ({ column, rowIndex, columnIndex }) => {
    if (columnIndex === 0) return `drag-icon-${rowIndex}`
    if (column.property === 'obj') return 'obj-cell-class'

    return ''
  }

  const gridOptions = reactive({
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
      { field: 'id', title: '', align: 'center', minWidth: 40, slots: { default: 'drag_icon' } },
      { field: 'layer', title: '层别', minWidth: 60 },
      { field: 'obj', title: '物件', minWidth: 140, slots: { default: 'obj_rect' } },
      { field: 'type', title: '类型', minWidth: 80, slots: { default: 'type_format' } },
      { field: 'specification', title: '规格', minWidth: 60 },
      { field: 'thickness', title: '理论厚度', minWidth: 80 },
      { field: 'residual_copper_rate', title: '残铜率(%)', minWidth: 80, editRender: {}, slots: { edit: 'edit_rate_input' } },
      { field: 'lamination_thickness', title: '压合厚度', minWidth: 80 },
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
        console.log(tableData.value)
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

  onMounted(() => {
    createTableSort()
  })
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
</style>
