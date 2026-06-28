import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export interface LocalizacionData {
  localizado_por_nombre: string
  localizado_por_contacto: string
  localizado_relacion: string
  localizado_nota: string
}

interface Props {
  nombre: string
  onCancel: () => void
  onConfirm: (data: LocalizacionData) => void
}

export default function LocalizarModal({ nombre, onCancel, onConfirm }: Props) {
  const { t } = useTranslation()
  const [porNombre, setPorNombre] = useState('')
  const [contacto, setContacto] = useState('')
  const [relacion, setRelacion] = useState('')
  const [nota, setNota] = useState('')
  const [error, setError] = useState<string | null>(null)

  function confirm() {
    if (!porNombre.trim() || !contacto.trim()) {
      setError(t('localizar_modal.error_required'))
      return
    }
    onConfirm({
      localizado_por_nombre: porNombre.trim(),
      localizado_por_contacto: contacto.trim(),
      localizado_relacion: relacion.trim(),
      localizado_nota: nota.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/40 md:items-center">
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-panel md:max-w-md md:rounded-2xl">
        <div className="mb-1 flex items-start justify-between">
          <h2 className="text-lg font-bold text-gray-900">{t('localizar_modal.title')}</h2>
          <button onClick={onCancel} aria-label={t('common.close')} className="text-2xl leading-none text-gray-400">
            ✕
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-600">
          {t('localizar_modal.description', { nombre })}
        </p>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              {t('localizar_modal.field_name')} <span className="text-hospital">*</span>
            </label>
            <input
              value={porNombre}
              onChange={(e) => setPorNombre(e.target.value)}
              placeholder={t('localizar_modal.ph_name')}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              {t('localizar_modal.field_contact')} <span className="text-hospital">*</span>
            </label>
            <input
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              placeholder={t('localizar_modal.ph_contact')}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              {t('localizar_modal.field_relation')}
            </label>
            <input
              value={relacion}
              onChange={(e) => setRelacion(e.target.value)}
              placeholder={t('localizar_modal.ph_relation')}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              {t('localizar_modal.field_note')}
            </label>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={2}
              placeholder={t('localizar_modal.ph_note')}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </div>

        {error && <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-hospital">{error}</div>}

        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-300 py-2.5 font-semibold text-gray-700"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={confirm}
            className="flex-1 rounded-xl bg-acopio py-2.5 font-semibold text-white"
          >
            {t('localizar_modal.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
