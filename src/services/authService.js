const API = 'http://localhost:3000/api'

/*
Intenta hacer login. Si tiene éxito, guarda el token y los datos del usuario
en localStorage y retorna { token, usuario }.
*/
export const login = async (email, password) => {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Error al iniciar sesión')
  }

  localStorage.setItem('token', data.token)
  localStorage.setItem('usuario', JSON.stringify(data.usuario))

  return data
}

/*
Registra una nueva cuenta. Retorna { mensaje, usuario } con rol null (pendiente).
*/
export const register = async (email, password) => {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Error al registrarse')
  }

  return data
}


//Cierra la sesión limpiando el localStorage.
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
}


//Devuelve el token almacenado (o null si no existe).
export const getToken = () => localStorage.getItem('token')

//Devuelve los datos del usuario almacenado (o null).
export const getUsuario = () => {
  const raw = localStorage.getItem('usuario')
  return raw ? JSON.parse(raw) : null
}

//Verifica si hay una sesión activa.
export const isAuthenticated = () => !!getToken()
