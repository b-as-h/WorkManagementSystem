<template>
  <div class="page-header-wrapper">
    <div class="page-header-left">
      <h2 v-if="title" style="margin: 0;">{{ title }}</h2>
      <slot name="subtitle" />
    </div>
    <div class="page-header-right">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' }
})
</script>

<style scoped>
.page-header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-header-right {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
