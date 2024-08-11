<template>
  <div class="fieldset-replace h-full">
    <div class="nomarl-title"> 阻抗表 </div>
    <vxe-grid v-bind="gridOptions" />
  </div>
</template>

<script setup>
  import { reactive } from 'vue'
  import { onBeforeMount } from 'vue'

  import $StackImpedance from '@/api/modules/stack-impedance.js'

  const sParams = window._globalServerParams

  const sexEditRender = reactive({
    name: 'VxeSelect',
    props: {
      placeholder: '',
    },
    options: [
      { label: '女', value: 'Women' },
      { label: '男', value: 'Man' },
    ],
  })
  const gridOptions = reactive({
    // editConfig: {
    //   trigger: 'click',
    //   mode: 'row',
    // },
    size: 'mini',
    border: true,
    height: '100%',
    columns: [
      { type: 'seq', width: 50, title: ' ' },
      {
        title: '客户原稿设计',
        children: [
          { field: 'name', title: '需求阻抗(ohm)', width: 110 },
          { field: 'sex', title: '阻抗层', editRender: sexEditRender },
          { field: 'param2', title: '阻抗模式', editRender: sexEditRender },
          { field: 'param1', title: '上参考层' },
          { field: 'param1', title: '下参考层' },
          { field: 'param1', title: '线宽' },
          { field: 'param1', title: '线距' },
          { field: 'param1', title: '到铜距离' },
        ],
      },
      {
        title: '客户原稿设计',
        children: [
          { field: 'param1', title: '线宽' },
          { field: 'param1', title: '线距' },
          { field: 'param1', title: '到铜距离' },
          { field: 'param1', title: '计算结果' },
        ],
      },
    ],
    data: [
      { id: 10001, name: 'Test1', role: 'Develop', sex: 'Man', age: 28, address: 'test abc' },
      { id: 10002, name: 'Test2', role: 'Test', sex: 'Women', age: 22, address: 'Guangzhou' },
    ],
  })

  onBeforeMount(async () => {
    $StackImpedance.impedanceEcamList({ fileId: sParams.fileid, tokenId: sParams.tokenid })
  })
</script>

<style scoped lang="scss"></style>
