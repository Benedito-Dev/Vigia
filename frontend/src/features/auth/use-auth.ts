export function estaAutenticado(): boolean {
  return Boolean(localStorage.getItem('vigia_token'))
}

export function logout() {
  localStorage.removeItem('vigia_token')
}
