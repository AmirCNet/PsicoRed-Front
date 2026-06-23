import { getToken } from './authService'

const API = 'http://localhost:3000/api'

const authHeaders = () => ({
  'Content-Type':  'application/json',
  'Authorization': `Bearer ${getToken()}`
})

export const getEspecializaciones = async () => {
  const res = await fetch(`${API}/especializaciones`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Error al obtener especializaciones')
  return res.json()
}
