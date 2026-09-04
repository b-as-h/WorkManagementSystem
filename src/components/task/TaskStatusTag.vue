<template>
  <el-tag :type="statusInfo.type" :effect="effect" size="size">
    {{ statusInfo.label }}
  </el-tag>
</template>

<script setup>
import { TASK_STATUS_MAP } from '@/utils/constants'

const props = defineProps({
  status: { type: String, required: true },
  effect: { type: String, default: 'light' },
  size: { type: String, default: 'default' }
})

const statusInfo = computed(() => TASK_STATUS_MAP[props.status] || { label: props.status, type: 'info' })
</script>
