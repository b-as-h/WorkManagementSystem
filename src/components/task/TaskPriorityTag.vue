<template>
  <el-tag :type="priorityInfo.type" :effect="effect" :size="size">
    {{ priorityInfo.label }}
  </el-tag>
</template>

<script setup>
import { TASK_PRIORITY_MAP } from '@/utils/constants'

const props = defineProps({
  priority: { type: String, required: true },
  effect: { type: String, default: 'light' },
  size: { type: String, default: 'default' }
})

const priorityInfo = computed(() => TASK_PRIORITY_MAP[props.priority] || { label: props.priority, type: 'info' })
</script>
