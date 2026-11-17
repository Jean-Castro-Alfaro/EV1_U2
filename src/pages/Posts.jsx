import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  obtenerPublicaciones,
  reaccionarPublicacion,
} from '../services/publicaciones'

const TIPOS_REACCION = [
  { tipo: 'like', etiqueta: 'Me gusta', emoji: '👍' },
  { tipo: 'love', etiqueta: 'Me encanta', emoji: '❤️' },
  { tipo: 'haha', etiqueta: 'Me divierte', emoji: '😂' },
  { tipo: 'wow', etiqueta: 'Me sorprende', emoji: '😮' },
  { tipo: 'sad', etiqueta: 'Me entristece', emoji: '😢' },
  { tipo: 'angry', etiqueta: 'Me enoja', emoji: '😡' },
]

function fechaPublicacion(createdAt) {
  if (!createdAt) return 'Fecha desconocida'

  const fecha = new Date(createdAt)
  if (Number.isNaN(fecha.getTime())) return 'Fecha desconocida'

  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha)
}

function Posts() {
  const [publicaciones, setPublicaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  const [reaccionando, setReaccionando] = useState({})
  const [erroresReaccion, setErroresReaccion] = useState({})
  const location = useLocation()

  useEffect(() => {
    let cancelado = false

    obtenerPublicaciones()
      .then((datos) => {
        if (!cancelado) setPublicaciones(datos)
      })
      .catch((e) => {
        if (!cancelado) setError(e.message)
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [intento])

  const reintentar = () => {
    setCargando(true)
    setError('')
    setIntento((actual) => actual + 1)
  }

  const manejarReaccion = async (publicacion, tipo) => {
    setReaccionando((actual) => ({ ...actual, [publicacion.id]: true }))
    setErroresReaccion((actual) => ({ ...actual, [publicacion.id]: '' }))

    try {
      const counts = await reaccionarPublicacion(publicacion.id, tipo)
      setPublicaciones((actual) =>
        actual.map((item) =>
          item.id === publicacion.id ? { ...item, reactions: counts } : item,
        ),
      )
    } catch (e) {
      setErroresReaccion((actual) => ({
        ...actual,
        [publicacion.id]: e.message,
      }))
    } finally {
      setReaccionando((actual) => ({ ...actual, [publicacion.id]: false }))
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Publicaciones
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Ideas, preguntas y recursos compartidos por la comunidad.
          </p>
        </div>
        <Link
          to="/crear-post"
          className="inline-flex justify-center rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
        >
          Crear publicación
        </Link>
      </header>

      {location.state?.mensaje && (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {location.state.mensaje}
        </p>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-medium text-red-700">
            No se pudieron cargar las publicaciones
          </p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={reintentar}
            className="mt-4 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {cargando && !error && (
        <p role="status" className="py-10 text-center text-sm text-neutral-500">
          Cargando publicaciones…
        </p>
      )}

      {!cargando && !error && publicaciones.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
          <p className="font-medium text-neutral-700">
            Todavía no hay publicaciones
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Puedes iniciar la conversación con tu clase.
          </p>
          <Link
            to="/crear-post"
            className="mt-4 inline-block rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
          >
            Crear la primera publicación
          </Link>
        </div>
      )}

      {!cargando && !error && publicaciones.length > 0 && (
        <div className="space-y-4">
          {publicaciones.map((publicacion) => (
            <article
              key={publicacion.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-violet-700">
                  {publicacion.author?.name || 'Usuario'}
                </p>
                <time
                  dateTime={publicacion.createdAt}
                  className="text-xs text-neutral-400"
                >
                  {fechaPublicacion(publicacion.createdAt)}
                </time>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-neutral-900">
                {publicacion.title}
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
                {publicacion.content}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
                {Object.entries(publicacion.reactions || {}).length > 0 ? (
                  Object.entries(publicacion.reactions || {}).map(
                    ([tipo, cantidad]) => (
                      <span
                        key={tipo}
                        className="rounded-full bg-violet-50 px-3 py-1 text-violet-700"
                      >
                        {tipo}: {cantidad}
                      </span>
                    ),
                  )
                ) : (
                  <span>Sin reacciones</span>
                )}
                <span>
                  {publicacion.commentsCount || 0}{' '}
                  {publicacion.commentsCount === 1 ? 'comentario' : 'comentarios'}
                </span>
              </div>
              <div className="mt-4 rounded-xl bg-neutral-50 p-4">
                <p className="mb-2 text-xs font-medium text-neutral-600">
                  Reacciona a esta publicación
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  {TIPOS_REACCION.map(({ tipo, etiqueta, emoji }) => (
                    <button
                      key={tipo}
                      type="button"
                      title={etiqueta}
                      aria-label={`Reaccionar: ${etiqueta}`}
                      disabled={reaccionando[publicacion.id]}
                      onClick={() => manejarReaccion(publicacion, tipo)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-violet-300 hover:bg-violet-50 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
                    >
                      <span aria-hidden="true">{emoji}</span>
                      <span>{tipo}</span>
                    </button>
                  ))}
                </div>
                {reaccionando[publicacion.id] && (
                  <p role="status" className="mt-2 text-xs text-neutral-500">
                    Enviando reacción…
                  </p>
                )}
                {erroresReaccion[publicacion.id] && (
                  <p role="alert" className="mt-2 text-xs text-red-600">
                    {erroresReaccion[publicacion.id]}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default Posts