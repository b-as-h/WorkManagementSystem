<template>
  <div class="page-container">
    <el-page-header @back="router.back()" :title="'返回'" :content="person?.name || '人员详情'" />

    <el-card v-if="person" style="margin-top: 20px;">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="姓名">{{ person.name }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{ person.position || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ person.department_name || '未分配' }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ person.role_name || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ person.phone || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ person.email || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="入职日期">{{ person.entry_date || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="person.status === 'active' ? 'success' : 'danger'">
            {{ person.status === 'active' ? '在职' : '离职' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card v-if="person" style="margin-top: 16px;">
      <template #header>
        <span>关联任务 ({{ personTasks.length }})</span>
      </template>
      <el-table :data="personTasks" stripe v-loading="taskLoading">
        <el-table-column prop="title" label="任务名称">
          <template #default="{ row }">
            <el-link type="primary" @click="router.push(`/task/${row.id}`)">{{ row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type" size="small">{{ statusMap[row.status]?.label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="80">
          <template #default="{ row }">
            <el-tag :type="priorityMap[row.priority]?.type" size="small">{{ priorityMap[row.priority]?.label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止日期" width="120" />
      </el-table>
      <el-empty v-if="!personTasks.length && !taskLoading" description="暂无关联任务" />
    </el-card>

    <el-empty v-if="!person && !loading" description="人员不存在" />
  </div>
</template>

<script setup>
import { usePersonnelStore } from '@/stores/personnel'
import { useTaskStore } from '@/stores/task'
import { TASK_STATUS_MAP, TASK_PRIORITY_MAP } from '@/utils/constants'

const route = useRoute()
const router = useRouter()
const personnelStore = usePersonnelStore()
const taskStore = useTaskStore()

const statusMap = TASK_STATUS_MAP
const priorityMap = TASK_PRIORITY_MAP

const loading = ref(false)
const taskLoading = ref(false)
const person = ref(null)
const personTasks = ref([])

async function loadData() {
  loading.value = true
  try {
    // 获取人员详情
    const [personResult] = await Promise.all([
      personnelStore.fetchPersonnel(),
      taskStore.fetchTasks({ assignee_id: route.params.id })
    ])

    person.value = personnelStore.personnelById(route.params.id)
    personTasks.value = taskStore.tasks.filter(t => t.assignee_id === route.params.id)
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
