import { post } from './api';

// 用户登录
export function login(username, password) {
  return post('/auth/login', { username, password });
}

export default {
  login
};
