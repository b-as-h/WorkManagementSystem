<template>
  <div style="padding: 16px 20px 0; background: #fff;">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-if="route.meta.parent">{{ route.meta.parent }}</el-breadcrumb-item>
      <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup>
const route = useRoute()
</script>
