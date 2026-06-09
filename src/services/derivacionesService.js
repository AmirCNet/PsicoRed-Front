import { getToken } from './authService'

const API = 'http://localhost:3000/api'

const authHeaders = () => ({
  'Content-Type':  'application/json',
  'Authorization': `Bearer ${getToken()}`
})

export const getDerivaciones = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString()
  const res = await fetch(`${API}/derivaciones${params ? '?' + params : ''}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Error al obtener derivaciones')
  return res.json()
}

export const getDerivacionById = async (id) => {
  const res = await fetch(`${API}/derivaciones/${id}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Derivación no encontrada')
  return res.json()
}

export const createDerivacion = async (derivacion) => {
  const res = await fetch(`${API}/derivaciones`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(derivacion)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al crear derivación')
  return data
}

export const updateDerivacion = async (id, cambios) => {
  const res = await fetch(`${API}/derivaciones/${id}`, {
    method:  'PUT',
    headers: authHeaders(),
    body:    JSON.stringify(cambios)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al actualizar derivación')
  return data
}

export const deleteDerivacion = async (id) => {
  const res = await fetch(`${API}/derivaciones/${id}`, {
    method:  'DELETE',
    headers: authHeaders()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al eliminar derivación')
  return data
}
