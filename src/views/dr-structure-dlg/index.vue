<template>
  <div class="dr-structure-container w-full h-full">
    <TableDrStructure ref="tableDrStructureRef" />
    <!-- <el-tabs v-model="activeName" class="laser-hole-tabs">
      <el-tab-pane label="结构表" name="first">
        <TableDrStructure />
      </el-tab-pane>
      <el-tab-pane label="激光孔统计" name="second">
        <TableLaserHole />
      </el-tab-pane>
    </el-tabs> -->

    <div class="footer">
      <div class="btn-group">
        <!-- <el-button size="small" @click="onClose">关闭</el-button> -->
        <el-button :loading="confirmLoading" class="btn" size="small" type="primary" @click="onConfirm">确认</el-button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'DrStructureDlg',
  }
</script>

<script setup>
  import _ from 'lodash'
  import { ref } from 'vue'

  // import $DrStructureDlg from '@/api/modules/dr-structure-dlg'
  import TableDrStructure from '@/views/dr-structure-dlg/components/TableDrStructure.vue'

  // import TableLaserHole from '@/views/dr-structure-dlg/components/TableLaserHole.vue'

  // const activeName = ref('first')

  const tableDrStructureRef = ref()

  const confirmLoading = ref(false)
  const onConfirm = async () => {
    confirmLoading.value = true
    const msgStr = await tableDrStructureRef.value?.writeDrillData()
    if (typeof msgStr !== 'string') await tableDrStructureRef.value?.initPage()
    confirmLoading.value = false
  }
</script>

<style scoped lang="scss">
  $footerHeight: 40px;
  .dr-structure-container {
    position: relative;
    top: 0;
    left: 0;
    padding-bottom: 40px;
    .footer {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: $footerHeight;
      background-color: #f5f5f5;
      padding: 10px;
      text-align: right;
      .btn {
        margin-left: 40px;
      }
    }
  }
  .laser-hole-tabs {
    height: 100%;
    :deep(.el-tabs) {
      height: 100%;
    }
    :deep(.el-tabs__content) {
      height: calc(100% - 55px);
    }
    :deep(.el-tab-pane) {
      height: 100%;
    }
  }
</style>
