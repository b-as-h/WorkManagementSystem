import { get, post, put, del } from './api';

// 获取所有人员
export function getPersonnel(params = {}) {
  return get('/personnel', params);
}

// 获取单个人员
export function getPerson(id) {
  return get(`/personnel/${id}`);
}

// 创建人员
export function createPerson(data) {
  return post('/personnel', data);
}

// 更新人员
export function updatePerson(id, data) {
  return put(`/personnel/${id}`, data);
}

// 删除人员
export function deletePerson(id) {
  return del(`/personnel/${id}`);
}

export default {
  getPersonnel,
  getPerson,
  createPerson,
  updatePerson,
  deletePerson
};
