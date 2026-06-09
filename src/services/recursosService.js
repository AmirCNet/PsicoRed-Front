import { getToken } from './authService'

const API = 'http://localhost:3000/api'

const authHeaders = () => ({
  'Content-Type':  'application/json',
  'Authorization': `Bearer ${getToken()}`
})

export const getRecursos = async () => {
  const res = await fetch(`${API}/recursos`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Error al obtener recursos')
  return res.json()
}

export const getRecursoById = async (id) => {
  const res = await fetch(`${API}/recursos/${id}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Recurso no encontrado')
  return res.json()
}

export const createRecurso = async (recurso) => {
  const res = await fetch(`${API}/recursos`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(recurso)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al crear recurso')
  return data
}

export const updateRecurso = async (id, cambios) => {
  const res = await fetch(`${API}/recursos/${id}`, {
    method:  'PUT',
    headers: authHeaders(),
    body:    JSON.stringify(cambios)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al actualizar recurso')
  return data
}

export const deleteRecurso = async (id) => {
  const res = await fetch(`${API}/recursos/${id}`, {
    method:  'DELETE',
    headers: authHeaders()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al eliminar recurso')
  return data
}
