import { getToken } from './authService'

const API = 'http://localhost:3000/api'

const authHeaders = () => ({
  'Content-Type':  'application/json',
  'Authorization': `Bearer ${getToken()}`
})

export const getTurnos = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString()
  const res = await fetch(`${API}/turnos${params ? '?' + params : ''}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Error al obtener turnos')
  return res.json()
}

export const getTurnoById = async (id) => {
  const res = await fetch(`${API}/turnos/${id}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Turno no encontrado')
  return res.json()
}

export const createTurno = async (turno) => {
  const res = await fetch(`${API}/turnos`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(turno)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al crear turno')
  return data
}

export const updateTurno = async (id, cambios) => {
  const res = await fetch(`${API}/turnos/${id}`, {
    method:  'PUT',
    headers: authHeaders(),
    body:    JSON.stringify(cambios)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al actualizar turno')
  return data
}

export const cancelarTurno = async (id) => {
  const res = await fetch(`${API}/turnos/${id}`, {
    method:  'DELETE',
    headers: authHeaders()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al cancelar turno')
  return data
}
