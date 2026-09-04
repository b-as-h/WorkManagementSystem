<template>
  <el-container style="height: 100vh;">
    <AppSidebar />
    <el-container>
      <AppHeader />
      <el-main style="background: #f0f2f5; padding: 0;">
        <BreadcrumbNav />
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
</script>
