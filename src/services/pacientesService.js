import { getToken } from './authService'

const API = 'http://localhost:3000/api'

const authHeaders = () => ({
  'Content-Type':  'application/json',
  'Authorization': `Bearer ${getToken()}`
})

export const getPacientes = async () => {
  const res = await fetch(`${API}/pacientes`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Error al obtener pacientes')
  return res.json()
}

export const getPacienteById = async (id) => {
  const res = await fetch(`${API}/pacientes/${id}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Paciente no encontrado')
  return res.json()
}

export const createPaciente = async (paciente) => {
  const res = await fetch(`${API}/pacientes`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(paciente)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al crear paciente')
  return data
}

export const updatePaciente = async (id, cambios) => {
  const res = await fetch(`${API}/pacientes/${id}`, {
    method:  'PUT',
    headers: authHeaders(),
    body:    JSON.stringify(cambios)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al actualizar paciente')
  return data
}

export const deletePaciente = async (id) => {
  const res = await fetch(`${API}/pacientes/${id}`, {
    method:  'DELETE',
    headers: authHeaders()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al eliminar paciente')
  return data
}
