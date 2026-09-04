export function loadFromStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('保存到 localStorage 失败:', e)
  }
}
