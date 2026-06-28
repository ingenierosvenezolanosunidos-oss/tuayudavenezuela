import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { reportarContenido } from '../lib/submit'

interface Props {
  reportId: string
  nombreRegistro: string
  onClose: () => void
}

export default function SolicitarEliminacionModal({ reportId, nombreRegistro, onClose }: Props) {
  const { t } = useTranslation()
  const [nombre, setNombre] = useState('')
  const [motivo, setMotivo] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function enviar() {
    if (!nombre.trim()) { setError(t('eliminar_modal.error_no_name')); return }
    if (!motivo.trim()) { setError(t('eliminar_modal.error_no_reason')); return }
    setError('')
    setSending(true)
    try {
      const detalle = `Solicitado por: ${nombre.trim()}\n\nMotivo: ${motivo.trim()}`
      await reportarContenido(reportId, 'Solicitud de eliminación', detalle)
      setDone(true)
    } catch {
      setDone(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/40 md:items-center">
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-panel md:max-w-md md:rounded-2xl">
        {done ? (
          <div className="py-6 text-center">
            <div className="mb-2 text-4xl">📩</div>
            <h2 className="text-lg font-bold text-gray-900">{t('eliminar_modal.done_title')}</h2>
            <p className="mt-1 text-sm text-gray-600">{t('eliminar_modal.done_message')}</p>
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-xl bg-brand py-2.5 font-semibold text-white"
            >
              {t('common.close')}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-1 flex items-start justify-between">
              <h2 className="text-lg font-bold text-gray-900">{t('eliminar_modal.title')}</h2>
              <button onClick={onClose} aria-label={t('common.close')} className="text-2xl leading-none text-gray-400">
                ✕
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              {t('eliminar_modal.record_label', { nombre: nombreRegistro })}
            </p>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  {t('eliminar_modal.field_name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={t('eliminar_modal.ph_name')}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  {t('eliminar_modal.field_reason')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={3}
                  placeholder={t('eliminar_modal.ph_reason')}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            </div>

            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

            <div className="mt-4 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 font-semibold text-gray-700"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={enviar}
                disabled={sending}
                className="flex-1 rounded-xl bg-red-500 py-2.5 font-semibold text-white disabled:opacity-60"
              >
                {sending ? t('common.sending') : t('eliminar_modal.submit')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
