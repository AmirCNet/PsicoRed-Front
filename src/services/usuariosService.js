const API = 'http://localhost:3000/api'
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

// Devuelve la lista de usuarios con rol pendiente (null)
export const getPendientes = async () => {
  const res = await fetch(`${API}/usuarios/pendientes`, { headers: headers() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al obtener pendientes')
  return data
}

// Aprobar un usuario pendiente asignándole rol profesional
export const aprobarUsuario = async (id) => {
  const res = await fetch(`${API}/usuarios/${id}/aprobar`, {
    method: 'PATCH',
    headers: headers()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al aprobar el usuario')
  return data
}
