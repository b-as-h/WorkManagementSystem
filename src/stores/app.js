import { defineStore } from 'pinia'
import { login as apiLogin } from '@/services/authService'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const currentUser = ref(JSON.parse(localStorage.getItem('wms_user') || 'null'))
  const loading = ref(false)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  async function login(username, password) {
    loading.value = true
    try {
      const result = await apiLogin(username, password)
      if (result.code === 200) {
        currentUser.value = result.data
        localStorage.setItem('wms_user', JSON.stringify(result.data))
        return { success: true, data: result.data }
      }
      return { success: false, message: result.message }
    } catch (error) {
      return { success: false, message: error.message || '登录失败' }
    } finally {
      loading.value = false
    }
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem('wms_user')
  }

  return { sidebarCollapsed, currentUser, loading, toggleSidebar, login, logout }
})
