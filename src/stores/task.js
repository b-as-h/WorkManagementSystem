import { defineStore } from 'pinia'
import { getTasks, getTask, createTask, updateTask, updateTaskStatus, deleteTask, getTaskStatistics } from '@/services/taskService'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref([])
  const loading = ref(false)
  const statistics = ref({
    total: 0,
    byStatus: { pending: 0, inProgress: 0, completed: 0, overdue: 0 },
    byPriority: { high: 0, medium: 0, low: 0 }
  })

  // 计算属性
  const taskById = computed(() => {
    return (id) => tasks.value.find(t => t.id === id)
  })

  const tasksByStatus = computed(() => {
    return (status) => tasks.value.filter(t => t.status === status)
  })

  const tasksByAssignee = computed(() => {
    return (personnelId) => tasks.value.filter(t => t.assignee_id === personnelId)
  })

  const taskStats = computed(() => {
    return statistics.value
  })

  // 从服务器加载任务列表
  async function fetchTasks(params = {}) {
    loading.value = true
    try {
      const result = await getTasks(params)
      if (result.code === 200) {
        tasks.value = result.data
      }
      return result
    } catch (error) {
      console.error('获取任务列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取任务统计
  async function fetchStatistics() {
    try {
      const result = await getTaskStatistics()
      if (result.code === 200) {
        statistics.value = result.data
      }
      return result
    } catch (error) {
      console.error('获取任务统计失败:', error)
      throw error
    }
  }

  // 获取单个任务详情
  async function fetchTaskById(id) {
    try {
      const result = await getTask(id)
      if (result.code === 200) {
        // 更新本地任务列表中的对应任务
        const index = tasks.value.findIndex(t => t.id === id)
        if (index !== -1) {
          tasks.value[index] = result.data
        }
        return result.data
      }
      return null
    } catch (error) {
      console.error('获取任务详情失败:', error)
      throw error
    }
  }

  // 添加任务
  async function addTask(taskData) {
    try {
      const result = await createTask(taskData)
      if (result.code === 201) {
        tasks.value.unshift(result.data)
        await fetchStatistics() // 刷新统计
        return result.data
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('创建任务失败:', error)
      throw error
    }
  }

  // 更新任务
  async function updateTaskData(id, updates) {
    try {
      const result = await updateTask(id, updates)
      if (result.code === 200) {
        const index = tasks.value.findIndex(t => t.id === id)
        if (index !== -1) {
          tasks.value[index] = result.data
        }
        await fetchStatistics() // 刷新统计
        return result.data
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('更新任务失败:', error)
      throw error
    }
  }

  // 删除任务
  async function removeTask(id) {
    try {
      const result = await deleteTask(id)
      if (result.code === 200) {
        tasks.value = tasks.value.filter(t => t.id !== id)
        await fetchStatistics() // 刷新统计
        return true
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('删除任务失败:', error)
      throw error
    }
  }

  // 更改任务状态
  async function changeTaskStatus(id, newStatus) {
    try {
      const result = await updateTaskStatus(id, newStatus)
      if (result.code === 200) {
        // 重新获取任务详情以获取最新数据
        await fetchTaskById(id)
        await fetchStatistics() // 刷新统计
        return true
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('更改任务状态失败:', error)
      throw error
    }
  }

  return {
    tasks, loading, statistics, taskStats,
    taskById, tasksByStatus, tasksByAssignee,
    fetchTasks, fetchStatistics, fetchTaskById,
    addTask, updateTask: updateTaskData, removeTask, changeTaskStatus
  }
})
