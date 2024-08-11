<template>
  <div class="stack-impedance">
    <div>
      <FormCondition />
    </div>
    <div class="flex table-container justify-start">
      <div style="width: 40%">
        <TableLaminatedStructure />
      </div>
      <div style="width: 60%">
        <TableImpedance />
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'StackImpedance',
  }
</script>

<script setup>
  import FormCondition from '@/views/stack-impedance/components/FormCondition.vue'
  import TableImpedance from '@/views/stack-impedance/components/TableImpedance.vue'
  import TableLaminatedStructure from '@/views/stack-impedance/components/TableLaminatedStructure.vue'
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
