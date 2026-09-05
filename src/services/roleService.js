import { get, post, put, del } from './api';

// 获取所有角色
export function getRoles() {
  return get('/roles');
}

// 创建角色
export function createRole(data) {
  return post('/roles', data);
}

// 更新角色
export function updateRole(id, data) {
  return put(`/roles/${id}`, data);
}

// 删除角色
export function deleteRole(id) {
  return del(`/roles/${id}`);
}

export default {
  getRoles,
  createRole,
  updateRole,
  deleteRole
};
