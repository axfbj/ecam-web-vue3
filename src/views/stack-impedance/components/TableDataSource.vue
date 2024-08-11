<template>
  <div :style="{ height: tableHeight + 'px' }">
    <vxe-grid ref="gridRef" v-bind="gridOptions">
      <template #header_label>
        <div class="font-normal">
          <el-input v-model="input" size="small" placeholder="请输入搜索条件" style="width: 100%" @input="onSreachChange" />
        </div>
      </template>
    </vxe-grid>
  </div>
</template>

<script setup>
  import _ from 'lodash'
  import { reactive, ref } from 'vue'

  const props = defineProps({
    data: {
      type: Array,
      default: () => [],
    },
    tableHeight: {
      type: Number,
      default: 300,
    },
    tableWidth: {
      type: Number,
      default: 300,
    },
  })
  const gridRef = ref()
  const input = ref('')

  const columns = ref([{ field: 'label', title: ' ', width: props.tableWidth, slots: { header: 'header_label' } }])

  const gridOptions = reactive({
    size: 'mini',
    border: true,
    height: '100%',
    rowConfig: { isCurrent: true },
    columns: columns,
    data: props.data,
  })

  const originalData = _.cloneDeep(props.data)

  const debouncedUpdate = _.debounce((query) => {
    gridOptions.data = originalData.filter((item) => item.label.indexOf(query) > -1)
  }, 200)

  const onSreachChange = (val) => {
    debouncedUpdate(val)
  }

  const getCurrentRowData = () => {
    if (gridRef.value) {
      return gridRef.value.getCurrentRecord()
    } else {
      return null
    }
  }

  defineExpose({ getCurrentRowData })
</script>
