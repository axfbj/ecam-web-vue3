<template>
  <!-- <el-button plain @click="dialogVisible = true"> Open a draggable Dialog </el-button> -->

  <el-dialog v-model="dialogVisible" :close-on-click-modal="false" :width="dialogConentWidth + 55" draggable :title="dialogTitle">
    <div class="w-full overflow-auto" :style="{ height: `${dialogConentHeight}px` }">
      <el-tabs v-model="activeName" class="demo-tabs" type="border-card" @tab-click="handleClick">
        <el-tab-pane label="芯板" name="tab1">
          <TableDataSource ref="tableDataSource1Ref" :data="coreOataList" :table-height="tableHeight" :table-width="dialogConentWidth" />
        </el-tab-pane>
        <el-tab-pane label="光板" name="tab2">
          <TableDataSource ref="tableDataSource2Ref" :data="boardDataList" :table-height="tableHeight" :table-width="dialogConentWidth" />
        </el-tab-pane>
        <el-tab-pane label="PP" name="tab3">
          <TableDataSource ref="tableDataSource3Ref" :data="ppDataList" :table-height="tableHeight" :table-width="dialogConentWidth" />
        </el-tab-pane>
        <el-tab-pane label="铜箔" name="tab4">
          <TableDataSource ref="tableDataSource4Ref" :data="copperFoilDataList" :table-height="tableHeight" :table-width="dialogConentWidth" />
        </el-tab-pane>
      </el-tabs>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button size="small" type="success" @click="onConfirm"> 应用 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import _ from 'lodash'
  import { computed, reactive, ref } from 'vue'

  import TableDataSource from '@/views/stack-impedance/components/TableDataSource.vue'
  import useTableDataSource from '@/views/stack-impedance/hooks/useTableDataSource.js'

  const emit = defineEmits(['confirm'])

  const { coreData, boardData, ppData, copperFoilData, copperFoilThickness } = useTableDataSource()

  const tableDataSource1Ref = ref()
  const tableDataSource2Ref = ref()
  const tableDataSource3Ref = ref()
  const tableDataSource4Ref = ref()

  const dialogVisible = ref(false)
  const dialogConentWidth = ref(400)
  const dialogConentHeight = ref(500)

  const tableHeight = dialogConentHeight.value - 42

  const activeName = ref('tab1')
  const activeMode = ref('')

  const handleClick = (tab, event) => {
    console.log(tab, event)
  }

  const coreOataList = reactive(
    (function () {
      return coreData.map((item) => ({ ...item, label: `${item['不含铜厚度']} 不含铜 ${item['顶层铜箔']}/${item['底层铜箔']}` }))
    })()
  )

  const boardDataList = reactive(
    (function () {
      return boardData.map((item) => ({ ...item, label: `${item['厚度']} 光版厚度` }))
    })()
  )

  const ppDataList = reactive(
    (function () {
      return ppData.map((item) => ({ ...item, label: `${item['PP型号']} 介质厚度 ${item['厚度']}` }))
    })()
  )
  const copperFoilDataList = reactive(
    (function () {
      return copperFoilData.map((item) => ({ ...item, label: `${item['铜类型']}\u00A0\u00A0\u00A0${item['厚度_OZ']}oz` }))
    })()
  )

  const statusList = {
    add: '添加',
    replace: '替换',
  }
  const dialogTitle = computed(() => `材料列表-${statusList[activeMode.value]}`)
  const toggleDialog = (show, flag) => {
    activeMode.value = flag || ''
    dialogVisible.value = typeof show === 'undefined' ? !dialogVisible.value : show
  }

  const onConfirm = () => {
    const dataItem = (() => {
      const item = {
        label: '',
        materialType: '',
        materialSpecifications: '',
        materialThickness: '',
        materialFinalThickness: '',
        residual_copper_rate_flag: '',
        residual_copper_rate_t: '',
        residual_copper_rate_b: '',
        residual_copper_rate_number_t: '',
        residual_copper_rate_number_b: '',
        residual_copper_rate: '',
        residual_copper_rate_number: '',
      }
      let tDataItem = null
      if (activeName.value === 'tab1') {
        // {
        //   label: '0.1 不含铜 H/H'
        //   不含铜厚度: 0.1
        //   含铜厚度: 0.135
        //   序号: 1
        //   底层铜箔: 'H'
        //   顶层铜箔: 'H'
        // }

        // 规格全部写含铜 ，理论厚度也是含铜的厚度
        tDataItem = tableDataSource1Ref.value.getCurrentRowData()
        item.materialType = 'core'
        item.materialSpecifications = '含铜'
        item.materialThickness = tDataItem['含铜厚度']
        // item.residual_copper_rate = `${tDataItem['底层铜箔']}/${tDataItem['顶层铜箔']}`
        item.residual_copper_rate_flag = `${tDataItem['顶层铜箔']}/${tDataItem['底层铜箔']}`

        item.residual_copper_rate_t = 70
        item.residual_copper_rate_b = 70

        item.residual_copper_rate_number_t = copperFoilThickness[`p_${tDataItem['顶层铜箔']}`]['厚度_mm']
        item.residual_copper_rate_number_b = copperFoilThickness[`p_${tDataItem['底层铜箔']}`]['厚度_mm']

        item.residual_copper_rate = `70/70`
        item.materialFinalThickness = tDataItem['含铜厚度']
      }

      if (activeName.value === 'tab2') {
        // label: '0.1 光版厚度'
        // 光板厚度: 0.1
        // 厚度: 0.1
        // 序号: 1
        tDataItem = tableDataSource2Ref.value.getCurrentRowData()
        item.materialType = 'bare_core'
        item.materialSpecifications = '光板'
        item.materialThickness = tDataItem['光板厚度']
        item.residual_copper_rate = '-'
        item.materialFinalThickness = tDataItem['光板厚度']
      }

      if (activeName.value === 'tab3') {
        // PP型号: 2116
        // label: '2116 介质厚度 0.114'
        // 厚度: 0.114
        // 序号: 3
        tDataItem = tableDataSource3Ref.value.getCurrentRowData()
        item.materialType = 'Prepreg'
        item.materialSpecifications = tDataItem['PP型号']
        item.materialThickness = tDataItem['厚度']
        item.residual_copper_rate = '-'
        // 计算改变
        item.materialFinalThickness = tDataItem['厚度']
      }

      if (activeName.value === 'tab4') {
        // label: '1/3oz'
        // 内外: '内层铜箔'
        // 厚度_OZ: '1/3'
        // 厚度_mm: 0.012
        // 序号: 1
        // 铜类型: 0.33

        tDataItem = tableDataSource4Ref.value.getCurrentRowData()
        item.materialType = 'Copper'
        item.materialSpecifications = '铜箔'
        item.materialThickness = `${tDataItem['厚度_mm']}`

        item.residual_copper_rate_flag = tDataItem['厚度_OZ']

        item.residual_copper_rate_number = String(copperFoilThickness[`p_${tDataItem['厚度_OZ']}`]['厚度_mm'])
        item.residual_copper_rate = '70'
        item.materialFinalThickness = `${tDataItem['厚度_mm']}`
      }
      item.label = tDataItem.label
      console.log('addItem', item)

      return item
    })()

    emit('confirm', { dataItem, activeMode: activeMode.value })
    dialogVisible.value = false
  }

  defineExpose({
    toggleDialog,
  })
</script>

<style scoped lang="scss">
  .demo-tabs {
    :deep(.el-tabs__content) {
      padding: 0 !important;
    }
  }
</style>
