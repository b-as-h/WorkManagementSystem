import { defineStore } from 'pinia'
import { getPersonnel, getPerson, createPerson, updatePerson, deletePerson } from '@/services/personnelService'
import { getDepartments, getDepartmentTree, createDepartment, updateDepartment, deleteDepartment } from '@/services/departmentService'
import { getRoles, createRole, updateRole, deleteRole } from '@/services/roleService'

export const usePersonnelStore = defineStore('personnel', () => {
  const personnel = ref([])
  const departments = ref([])
  const departmentTree = ref([])
  const roles = ref([])
  const loading = ref(false)

  // ---- getters ----
  const personnelById = computed(() => {
    return (id) => personnel.value.find(p => p.id === id)
  })

  const personnelByDept = computed(() => {
    return (deptId) => personnel.value.filter(p => p.department_id === deptId)
  })

  const deptById = computed(() => {
    return (id) => departments.value.find(d => d.id === id)
  })

  const roleById = computed(() => {
    return (id) => roles.value.find(r => r.id === id)
  })

  // ---- 数据加载 ----
  async function fetchPersonnel(params = {}) {
    loading.value = true
    try {
      const result = await getPersonnel(params)
      if (result.code === 200) {
        personnel.value = result.data
      }
      return result
    } catch (error) {
      console.error('获取人员列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchDepartments() {
    try {
      const result = await getDepartments()
      if (result.code === 200) {
        departments.value = result.data
      }
      return result
    } catch (error) {
      console.error('获取部门列表失败:', error)
      throw error
    }
  }

  async function fetchDepartmentTree() {
    try {
      const result = await getDepartmentTree()
      if (result.code === 200) {
        departmentTree.value = result.data
      }
      return result
    } catch (error) {
      console.error('获取部门树失败:', error)
      throw error
    }
  }

  async function fetchRoles() {
    try {
      const result = await getRoles()
      if (result.code === 200) {
        roles.value = result.data
      }
      return result
    } catch (error) {
      console.error('获取角色列表失败:', error)
      throw error
    }
  }

  // 加载所有基础数据
  async function fetchAllData() {
    await Promise.all([
      fetchPersonnel(),
      fetchDepartments(),
      fetchDepartmentTree(),
      fetchRoles()
    ])
  }

  // ---- 人员操作 ----
  async function addPerson(data) {
    try {
      const result = await createPerson(data)
      if (result.code === 201) {
        personnel.value.unshift(result.data)
        return result.data
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('创建人员失败:', error)
      throw error
    }
  }

  async function updatePersonData(id, updates) {
    try {
      const result = await updatePerson(id, updates)
      if (result.code === 200) {
        const index = personnel.value.findIndex(p => p.id === id)
        if (index !== -1) {
          personnel.value[index] = result.data
        }
        return result.data
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('更新人员失败:', error)
      throw error
    }
  }

  async function removePerson(id) {
    try {
      const result = await deletePerson(id)
      if (result.code === 200) {
        personnel.value = personnel.value.filter(p => p.id !== id)
        return true
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('删除人员失败:', error)
      throw error
    }
  }

  // ---- 部门操作 ----
  async function addDepartment(data) {
    try {
      const result = await createDepartment(data)
      if (result.code === 201) {
        departments.value.push(result.data)
        await fetchDepartmentTree() // 刷新部门树
        return result.data
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('创建部门失败:', error)
      throw error
    }
  }

  async function updateDepartmentData(id, updates) {
    try {
      const result = await updateDepartment(id, updates)
      if (result.code === 200) {
        const index = departments.value.findIndex(d => d.id === id)
        if (index !== -1) {
          departments.value[index] = result.data
        }
        await fetchDepartmentTree() // 刷新部门树
        return result.data
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('更新部门失败:', error)
      throw error
    }
  }

  async function removeDepartment(id) {
    try {
      const result = await deleteDepartment(id)
      if (result.code === 200) {
        departments.value = departments.value.filter(d => d.id !== id)
        await fetchDepartmentTree() // 刷新部门树
        return { success: true }
      }
      return { success: false, message: result.message }
    } catch (error) {
      console.error('删除部门失败:', error)
      return { success: false, message: error.message }
    }
  }

  // ---- 角色操作 ----
  async function addRole(data) {
    try {
      const result = await createRole(data)
      if (result.code === 201) {
        roles.value.push(result.data)
        return result.data
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('创建角色失败:', error)
      throw error
    }
  }

  async function updateRoleData(id, updates) {
    try {
      const result = await updateRole(id, updates)
      if (result.code === 200) {
        const index = roles.value.findIndex(r => r.id === id)
        if (index !== -1) {
          roles.value[index] = result.data
        }
        return result.data
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('更新角色失败:', error)
      throw error
    }
  }

  async function removeRole(id) {
    try {
      const result = await deleteRole(id)
      if (result.code === 200) {
        roles.value = roles.value.filter(r => r.id !== id)
        return { success: true }
      }
      return { success: false, message: result.message }
    } catch (error) {
      console.error('删除角色失败:', error)
      return { success: false, message: error.message }
    }
  }

  return {
    personnel, departments, departmentTree, roles, loading,
    personnelById, personnelByDept, deptById, roleById,
    fetchPersonnel, fetchDepartments, fetchDepartmentTree, fetchRoles, fetchAllData,
    addPerson, updatePerson: updatePersonData, removePerson,
    addDepartment, updateDepartment: updateDepartmentData, removeDepartment,
    addRole, updateRole: updateRoleData, removeRole
  }
})
