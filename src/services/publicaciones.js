const API_URL = import.meta.env.VITE_API_URL

export async function obtenerPublicaciones() {
  const respuesta = await fetch(`${API_URL}/posts`, { method: 'GET' })
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(datos.error || 'No se pudieron obtener las publicaciones')
  }

  return datos.posts
}

export async function crearPublicacion(publicacion) {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Debes iniciar sesión para crear una publicación')
  }

  const respuesta = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(publicacion),
  })
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(datos.error || 'No se pudo crear la publicación')
  }

  return datos.post
}

export async function reaccionarPublicacion(postId, tipo) {
  const usuario = JSON.parse(localStorage.getItem('user') || 'null')
  const respuesta = await fetch(`${API_URL}/posts/${postId}/reactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: tipo, userId: usuario?.id }),
  })
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(datos.error || 'No se pudo registrar la reacción')
  }

  if (!datos.counts || typeof datos.counts !== 'object' || Array.isArray(datos.counts)) {
    throw new Error('El servidor no devolvió los contadores de reacciones')
  }

  return datos.counts
}