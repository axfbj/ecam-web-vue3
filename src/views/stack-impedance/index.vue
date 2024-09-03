<template>
  <div class="stack-impedance">
    <div>
      <FormCondition v-model="numberValidateForm" @input-layer="onInputLayer" @loading-scheme="onLoadingScheme" @save-scheme="onSaveScheme" />
    </div>
    <div class="flex table-container justify-start">
      <div style="width: 40%">
        <TableLaminatedStructure
          ref="tableLaminatedStructureRef"
          :structural-plan="numberValidateForm.structuralPlan"
          :inner-layer-copper-thickness="numberValidateForm.innerLayerCopperThickness"
          :thickness="numberValidateForm.thickness"
          :layer="numberValidateForm.layer"
          @update-layer-count="updateLayerCount"
        />
      </div>
      <div style="width: 60%">
        <TableImpedance ref="tableImpedanceRef" />
      </div>
    </div>
    <!-- {{ numberValidateForm.layer }} -->
  </div>
</template>
<script>
  export default {
    name: 'StackImpedance',
  }
</script>

<script setup>
  import _ from 'lodash'
  import { reactive, ref } from 'vue'

  import { readFile } from '@/utils/QTMethods'
  import FormCondition from '@/views/stack-impedance/components/FormCondition.vue'
  import TableImpedance from '@/views/stack-impedance/components/TableImpedance.vue'
  import TableLaminatedStructure from '@/views/stack-impedance/components/TableLaminatedStructure.vue'

  const tableLaminatedStructureRef = ref(null)
  const tableImpedanceRef = ref(null)

  const numberValidateForm = reactive({
    layer: null,
    thickness: 1.6,
    innerLayerCopperThickness: '1oz',
    structuralPlan: 'A',
  })

  const updateLayerCount = (count) => {
    numberValidateForm.layer = count
  }

  const onInputLayer = async () => {
    const laminatedStructureTmp = await (async () => {
      if (window.qt) return await readFile('localStorageFiles/stackImpedance.json')
      else return JSON.parse(localStorage.getItem('laminatedStructureTmp')) || {}
    })()

    const layerTemp = laminatedStructureTmp[`layer_${numberValidateForm.layer}`]
    if (_.isObject(layerTemp)) {
      const planObj =
        layerTemp[`plan_${numberValidateForm.structuralPlan}_p1_${numberValidateForm.thickness}_p2${numberValidateForm.innerLayerCopperThickness}`]
      if (_.isObject(planObj)) {
        // numberValidateForm.thickness = planObj.thickness
        // numberValidateForm.innerLayerCopperThickness = planObj.innerLayerCopperThickness
        tableLaminatedStructureRef.value.updateTableData(planObj.tableData || [])
      } else {
        tableLaminatedStructureRef.value.updateTableData([])
      }
    } else {
      tableLaminatedStructureRef.value.updateTableData([])
    }
  }

  const onLoadingScheme = async () => {
    tableLaminatedStructureRef.value.initComponent()
    tableImpedanceRef.value.initComponent()
  }

  const onSaveScheme = () => {
    tableLaminatedStructureRef.value.saveEcamLaminatedStructure()
    tableImpedanceRef.value.saveEcamImpedance()
  }
</script>

<style scoped lang="scss">
  .stack-impedance {
    .table-container {
      > div {
        padding: 5px;
        height: 600px;
      }
    }
  }
</style>
