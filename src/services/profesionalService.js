const API = 'http://localhost:3000/api'

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

// Devuelve el perfil del profesional logueado (null si aún no lo completó)
export const getMiPerfil = async () => {
  const res = await fetch(`${API}/profesionales/mi-perfil`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Error al obtener perfil')
  return res.json()  // null o el objeto de perfil
}

// Crea el perfil profesional del usuario logueado
export const crearMiPerfil = async (datos) => {
  const res = await fetch(`${API}/profesionales`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(datos)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al crear perfil')
  return data
}

export const getProfesionales = async () => {
  const res = await fetch(`${API}/profesionales`, { headers: authHeaders() })
  return res.json()
}

export const addProfesional = async (profesional) => {
  const res = await fetch(`${API}/profesionales`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(profesional)
  })
  return res.json()
}

export const updateProfesional = async (id, cambios) => {
  const res = await fetch(`${API}/profesionales/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(cambios)
  })
  return res.json()
}

export const deleteProfesional = async (id) => {
  await fetch(`${API}/profesionales/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
}
