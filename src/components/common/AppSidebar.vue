<template>
  <el-aside :width="appStore.sidebarCollapsed ? '64px' : '210px'" style="transition: width 0.3s; background: #304156; overflow: hidden;">
    <div class="logo-area">
      <span v-if="!appStore.sidebarCollapsed" class="logo-text">工作管理系统</span>
      <span v-else class="logo-text-short">WMS</span>
    </div>
    <el-menu
      :default-active="currentRoute"
      :collapse="appStore.sidebarCollapsed"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      router
      :collapse-transition="false"
    >
      <el-menu-item index="/dashboard">
        <el-icon><Odometer /></el-icon>
        <template #title>仪表盘</template>
      </el-menu-item>

      <el-sub-menu index="task-group">
        <template #title>
          <el-icon><List /></el-icon>
          <span>任务管理</span>
        </template>
        <el-menu-item index="/task">
          <el-icon><Document /></el-icon>
          <template #title>任务列表</template>
        </el-menu-item>
        <el-menu-item index="/task/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>任务统计</template>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="personnel-group">
        <template #title>
          <el-icon><User /></el-icon>
          <span>人员管理</span>
        </template>
        <el-menu-item index="/personnel">
          <el-icon><UserFilled /></el-icon>
          <template #title>人员列表</template>
        </el-menu-item>
        <el-menu-item index="/personnel/department">
          <el-icon><OfficeBuilding /></el-icon>
          <template #title>部门管理</template>
        </el-menu-item>
        <el-menu-item index="/personnel/role">
          <el-icon><Lock /></el-icon>
          <template #title>角色权限</template>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { useAppStore } from '@/stores/app'

const route = useRoute()
const appStore = useAppStore()

const currentRoute = computed(() => route.path)
</script>

<style scoped>
.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-text-short {
  font-size: 20px;
}

.el-menu {
  border-right: none;
}
</style>
