<template>
  <el-empty :description="description" :image-size="imageSize">
    <slot />
  </el-empty>
</template>

<script setup>
defineProps({
  description: { type: String, default: '暂无数据' },
  imageSize: { type: Number, default: 160 }
})
</script>
