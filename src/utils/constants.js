// 任务状态
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
}

export const TASK_STATUS_MAP = {
  pending: { label: '待处理', type: 'info' },
  inProgress: { label: '进行中', type: 'warning' },
  completed: { label: '已完成', type: 'success' },
}

// 任务优先级
export const TASK_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

export const TASK_PRIORITY_MAP = {
  high: { label: '高', type: 'danger' },
  medium: { label: '中', type: 'warning' },
  low: { label: '低', type: 'info' },
}

// 人员状态
export const PERSON_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
}

export const PERSON_STATUS_MAP = {
  active: { label: '在职', type: 'success' },
  inactive: { label: '离职', type: 'danger' },
}

// 所有权限列表
export const ALL_PERMISSIONS = [
  { key: 'all', label: '全部权限' },
  { key: 'task.assign', label: '分配任务' },
  { key: 'task.view', label: '查看任务' },
  { key: 'task.updateOwn', label: '更新自己的任务' },
  { key: 'task.manage', label: '管理所有任务' },
  { key: 'personnel.view', label: '查看人员' },
  { key: 'personnel.manage', label: '管理人员' },
  { key: 'department.manage', label: '管理部门' },
  { key: 'role.manage', label: '管理角色' },
]
