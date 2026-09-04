import { get, post, put, del } from './api';

// 获取所有任务
export function getTasks(params = {}) {
  return get('/tasks', params);
}

// 获取任务统计
export function getTaskStatistics() {
  return get('/tasks/statistics');
}

// 获取单个任务
export function getTask(id) {
  return get(`/tasks/${id}`);
}

// 创建任务
export function createTask(data) {
  return post('/tasks', data);
}

// 更新任务
export function updateTask(id, data) {
  return put(`/tasks/${id}`, data);
}

// 更新任务状态
export function updateTaskStatus(id, status) {
  return put(`/tasks/${id}/status`, { status });
}

// 删除任务
export function deleteTask(id) {
  return del(`/tasks/${id}`);
}

export default {
  getTasks,
  getTaskStatistics,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};
