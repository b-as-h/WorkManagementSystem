import { post } from './api';

// 用户登录
export function login(username, password) {
  return post('/auth/login', { username, password });
}

// 用户注册
export function register(username, password, name) {
  return post('/auth/register', { username, password, name });
}

export default {
  login,
  register
};
