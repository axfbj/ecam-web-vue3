<template>
  <div class="form1">
    <el-form ref="formRef" size="small" :model="numberValidateForm" label-width="auto" :inline="true">
      <div class="flex justify-between">
        <div>
          <el-form-item label-width="60px" label="板子层数:" label-position="right">
            <el-input v-model.number="numberValidateForm.layer" type="number" :style="formInputWidth" @input="onInputLayer" />
          </el-form-item>
          <el-form-item label-width="40px" label="板厚:" label-position="right">
            <el-select v-model="numberValidateForm.thickness" :style="formInputWidth" placeholder="" @change="onInputLayer">
              <el-option v-for="item in thicknessOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label-width="60px" label="内层铜厚:" label-position="right">
            <el-select v-model="numberValidateForm.innerLayerCopperThickness" :style="formInputWidth" placeholder="" @change="onInputLayer">
              <el-option v-for="item in innerLayerCopperThicknessOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label-width="60px" label="结构方案:" label-position="right">
            <el-select v-model="numberValidateForm.structuralPlan" :style="formInputWidth" placeholder="" @change="onInputLayer">
              <el-option v-for="item in structuralPlanOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm(formRef)">加载叠构抗阻</el-button>
            <!-- <el-button @click="saveForm(formRef)">保存叠构抗阻</el-button> -->
          </el-form-item>
        </div>
        <!-- <div>
          <el-form-item label-width="60px" label="单位:" label-position="right">
            <el-select v-model="numberValidateForm.unit" :style="formInputWidth" placeholder="">
              <el-option v-for="item in unitOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div> -->
      </div>
    </el-form>
    <!-- {{ options }} -->
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'

  const emit = defineEmits(['input-layer', 'loading-scheme', 'save-scheme'])

  const formInputWidth = { width: '100px' }

  const formRef = ref(null)

  const thicknessOptions = computed(() => {
    const items = [0.6, 0.8, 1.0, 1.2, 1.6, 2.0, 2.5]
    const options = items.map((item) => {
      return { value: item, label: item }
    })
    return options
  })

  const innerLayerCopperThicknessOptions = computed(() => {
    const items = ['0.5oz', '1oz']
    const options = items.map((item) => {
      return { value: item, label: item }
    })
    return options
  })

  const structuralPlanOptions = computed(() => {
    const items = ['A', 'B']
    const options = items.map((item) => {
      return { value: item, label: item }
    })
    return options
  })
  // const unitOptions = computed(() => {
  //   const items = ['mil', 'mm']
  //   const options = items.map((item) => {
  //     return { value: item, label: item }
  //   })
  //   return options
  // })
  const numberValidateForm = defineModel({
    type: Object,
    default: {
      layer: null,
      thickness: '',
      innerLayerCopperThickness: '',
      structuralPlan: '',
    },
  })
  // const numberValidateForm = reactive({
  //   layer: null,
  //   thickness: '',
  //   innerLayerCopperThickness: '',
  //   structuralPlan: '',
  // })

  const submitForm = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
      if (valid) {
        // console.log('submit!')
        emit('loading-scheme')
      } else {
        console.log('error submit!')
      }
    })
  }

  const onInputLayer = () => {
    emit('input-layer')
  }

  // const saveForm = (formEl) => {
  //   if (!formEl) return
  //   // formEl.resetFields()
  //   emit('save-scheme')
  // }
</script>

<style lang="scss" scoped>
  .form1 {
    :deep([class*='el-form-item']) {
      margin-bottom: 0 !important;
      margin-right: 5px !important;
      .el-form-item__label {
        padding: 0;
      }
    }
    :deep(.el-input-number) {
      .el-input__wrapper {
        padding: 0 7px;
        height: 24px;
        .el-input__inner {
          text-align: left;
        }
      }
    }
    // el-input-number
  }
</style>
