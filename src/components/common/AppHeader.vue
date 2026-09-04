<template>
  <el-header style="background: #fff; border-bottom: 1px solid #e6e6e6; display: flex; align-items: center; justify-content: space-between; padding: 0 20px;">
    <div style="display: flex; align-items: center; gap: 16px;">
      <el-icon style="cursor: pointer; font-size: 20px;" @click="appStore.toggleSidebar">
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>
    </div>
    <div style="display: flex; align-items: center; gap: 16px;">
      <el-dropdown @command="handleCommand">
        <span style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #303133;">
          <el-avatar :size="32" style="background: #409eff;">
            {{ appStore.currentUser?.name?.charAt(0) || 'U' }}
          </el-avatar>
          <span>{{ appStore.currentUser?.name || '用户' }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup>
import { useAppStore } from '@/stores/app'

const router = useRouter()
const appStore = useAppStore()

function handleCommand(command) {
  if (command === 'logout') {
    appStore.logout()
    router.push('/login')
  }
}
</script>
