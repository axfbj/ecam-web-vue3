<template>
  <div>
    <div v-if="materialType === 'Core'" class="obj-rect-1">
      <div class="type1-rect-1"></div>
      <div class="type1-rect-2">{{ text }}</div>
      <div class="type1-rect-3"></div>
    </div>
    <div v-else-if="materialType === 'bare_core'" class="obj-rect-2">
      <div>{{ text }}</div>
    </div>
    <div v-else-if="materialType === 'Prepreg'" class="obj-rect-3">
      <div></div>
    </div>
    <div v-else-if="materialType === 'Copper'" class="obj-rect-4">
      <div></div>
    </div>
    <div v-else-if="materialType === 'Substrate'" class="obj-rect-2">
      <div>{{ text }}</div>
    </div>
  </div>
</template>

<script setup>
  defineProps({
    materialType: {
      type: String,
      default: '1',
    },
    text: {
      type: String,
      default: '',
    },
  })
</script>

<style lang="scss" scoped>
  $color-1: #ff8c00;
  $color-2: #6e5447;
  $mHeight: 6px;
  @mixin flex-text-center() {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #adadad;
  }

  .obj-rect-1,
  .obj-rect-2,
  .obj-rect-3 {
    > div {
      width: 100%;
    }
  }
  .obj-rect-1 {
    background-color: red;
    .type1-rect-1 {
      height: $mHeight;
      background-color: $color-1;
    }
    .type1-rect-2 {
      height: $mHeight * 3;
      background-color: $color-2;
      @include flex-text-center();
    }
    .type1-rect-3 {
      height: $mHeight;
      background-color: $color-1;
    }
  }

  .obj-rect-2 {
    div {
      height: $mHeight * 5;
      background-color: $color-2;
      @include flex-text-center();
    }
  }
  .obj-rect-3 {
    div {
      height: $mHeight;
      background-color: $color-2;
    }
  }

  .obj-rect-4 {
    div {
      height: $mHeight;
      background-color: $color-1;
    }
  }
</style>
