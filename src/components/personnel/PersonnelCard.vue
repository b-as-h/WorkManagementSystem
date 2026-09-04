<template>
  <el-card shadow="hover" class="person-card" @click="$emit('click')">
    <div class="card-content">
      <el-avatar :size="48" style="background: #409eff; flex-shrink: 0;">
        {{ person.name?.charAt(0) || '?' }}
      </el-avatar>
      <div class="card-info">
        <div class="card-name">{{ person.name }}</div>
        <div class="card-position">{{ person.position || '未设置职位' }}</div>
        <div class="card-dept">
          <el-tag size="small" type="info">{{ deptName }}</el-tag>
          <el-tag size="small" :type="person.status === 'active' ? 'success' : 'danger'" style="margin-left: 4px;">
            {{ person.status === 'active' ? '在职' : '离职' }}
          </el-tag>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { usePersonnelStore } from '@/stores/personnel'

const props = defineProps({
  person: { type: Object, required: true }
})

defineEmits(['click'])

const personnelStore = usePersonnelStore()

const deptName = computed(() => {
  const dept = personnelStore.deptById(props.person.departmentId)
  return dept?.name || '未分配'
})
</script>

<style scoped>
.person-card {
  cursor: pointer;
  transition: transform 0.2s;
}
.person-card:hover {
  transform: translateY(-2px);
}
.card-content {
  display: flex;
  gap: 12px;
  align-items: center;
}
.card-info {
  flex: 1;
  min-width: 0;
}
.card-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.card-position {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}
.card-dept {
  margin-top: 6px;
  display: flex;
  gap: 4px;
}
</style>
