import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { crearPublicacion } from '../services/publicaciones'

const inputClass =
  'w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-400 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20'

const labelClass = 'mb-1.5 block text-sm font-medium text-neutral-700'

function CrearPost() {
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()
  const tieneSesion = Boolean(localStorage.getItem('token'))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const publicacion = {
      title: titulo.trim(),
      content: contenido.trim(),
    }

    if (!publicacion.title || !publicacion.content) {
      setError('Completa el título y el contenido antes de publicar')
      return
    }

    setEnviando(true)
    try {
      await crearPublicacion(publicacion)
      navigate('/posts', {
        state: { mensaje: 'Tu publicación se creó correctamente.' },
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header>
        <Link
          to="/posts"
          className="text-sm font-medium text-violet-700 hover:text-violet-800"
        >
          ← Volver a publicaciones
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900">
          Crear publicación
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Comparte una pregunta, idea o recurso con tu clase.
        </p>
      </header>

      {!tieneSesion ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-medium text-amber-900">
            Necesitas una cuenta para publicar
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Regístrate para iniciar sesión y compartir con la comunidad.
          </p>
          <Link
            to="/registrarme"
            className="mt-4 inline-block rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
          >
            Registrarme
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <label htmlFor="titulo-publicacion" className={labelClass}>
              Título
            </label>
            <input
              id="titulo-publicacion"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={inputClass}
              placeholder="¿Qué quieres compartir?"
              required
            />
          </div>
          <div>
            <label htmlFor="contenido-publicacion" className={labelClass}>
              Contenido
            </label>
            <textarea
              id="contenido-publicacion"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              className={`${inputClass} min-h-40 resize-y`}
              placeholder="Escribe aquí tu pregunta, idea o recurso…"
              rows={7}
              required
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/posts"
              className="rounded-full px-5 py-2.5 text-center text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-100"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={enviando}
              className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? 'Publicando…' : 'Publicar'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default CrearPost