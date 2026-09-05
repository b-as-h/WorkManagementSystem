import { get, post, put, del } from './api';

// 获取所有部门
export function getDepartments() {
  return get('/departments');
}

// 获取部门树结构
export function getDepartmentTree() {
  return get('/departments/tree');
}

// 创建部门
export function createDepartment(data) {
  return post('/departments', data);
}

// 更新部门
export function updateDepartment(id, data) {
  return put(`/departments/${id}`, data);
}

// 删除部门
export function deleteDepartment(id) {
  return del(`/departments/${id}`);
}

export default {
  getDepartments,
  getDepartmentTree,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
