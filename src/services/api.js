// API 基础配置
const API_BASE_URL = 'http://localhost:3001/api';

// 通用请求方法
async function request(url, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
}

// GET 请求
export function get(url, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  return request(fullUrl);
}

// POST 请求
export function post(url, data) {
  return request(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// PUT 请求
export function put(url, data) {
  return request(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// DELETE 请求
export function del(url) {
  return request(url, {
    method: 'DELETE'
  });
}

export default {
  get,
  post,
  put,
  del
};
