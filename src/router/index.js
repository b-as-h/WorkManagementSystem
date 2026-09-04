import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      },
      {
        path: 'task',
        name: 'TaskList',
        component: () => import('../views/task/TaskList.vue'),
        meta: { title: '任务列表', icon: 'List', parent: '任务管理' }
      },
      {
        path: 'task/:id',
        name: 'TaskDetail',
        component: () => import('../views/task/TaskDetail.vue'),
        meta: { title: '任务详情', hidden: true, parent: '任务管理' }
      },
      {
        path: 'task/statistics',
        name: 'TaskStatistics',
        component: () => import('../views/task/TaskStatistics.vue'),
        meta: { title: '任务统计', icon: 'DataAnalysis', parent: '任务管理' }
      },
      {
        path: 'personnel',
        name: 'PersonnelList',
        component: () => import('../views/personnel/PersonnelList.vue'),
        meta: { title: '人员列表', icon: 'User', parent: '人员管理' }
      },
      {
        path: 'personnel/:id',
        name: 'PersonnelDetail',
        component: () => import('../views/personnel/PersonnelDetail.vue'),
        meta: { title: '人员详情', hidden: true, parent: '人员管理' }
      },
      {
        path: 'personnel/department',
        name: 'DepartmentManage',
        component: () => import('../views/personnel/DepartmentManage.vue'),
        meta: { title: '部门管理', icon: 'OfficeBuilding', parent: '人员管理' }
      },
      {
        path: 'personnel/role',
        name: 'RoleManage',
        component: () => import('../views/personnel/RoleManage.vue'),
        meta: { title: '角色权限', icon: 'Lock', parent: '人员管理' }
      },
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('wms_user')
  if (to.meta.requiresAuth !== false && !isAuthenticated) {
    next({ name: 'Login' })
  } else {
    document.title = `${to.meta.title || '工作管理系统'} - WMS`
    next()
  }
})

export default router
