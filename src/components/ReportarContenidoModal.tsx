import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { reportarContenido } from '../lib/submit'

interface Props {
  reportId: string
  onClose: () => void
}

const MOTIVOS_KEYS = [
  { value: 'Contenido obsceno',  tkey: 'reportar_modal.motivo_obsceno' },
  { value: 'Información falsa',  tkey: 'reportar_modal.motivo_falso' },
  { value: 'Duplicado',          tkey: 'reportar_modal.motivo_duplicado' },
  { value: 'Otro',               tkey: 'reportar_modal.motivo_otro' },
] as const

export default function ReportarContenidoModal({ reportId, onClose }: Props) {
  const { t } = useTranslation()
  const [motivo, setMotivo] = useState<string>(MOTIVOS_KEYS[0].value)
  const [detalle, setDetalle] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  async function enviar() {
    setSending(true)
    try {
      await reportarContenido(reportId, motivo, detalle.trim())
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
            <div className="mb-2 text-4xl">🙏</div>
            <h2 className="text-lg font-bold text-gray-900">{t('reportar_modal.done_title')}</h2>
            <p className="mt-1 text-sm text-gray-600">{t('reportar_modal.done_message')}</p>
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
              <h2 className="text-lg font-bold text-gray-900">{t('reportar_modal.title')}</h2>
              <button onClick={onClose} aria-label={t('common.close')} className="text-2xl leading-none text-gray-400">
                ✕
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-600">{t('reportar_modal.description')}</p>

            <div className="space-y-2">
              {MOTIVOS_KEYS.map((m) => (
                <label
                  key={m.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm"
                  style={
                    motivo === m.value
                      ? { borderColor: '#2563EB', backgroundColor: '#EFF4FF' }
                      : { borderColor: '#e5e7eb' }
                  }
                >
                  <input
                    type="radio"
                    name="motivo"
                    checked={motivo === m.value}
                    onChange={() => setMotivo(m.value)}
                  />
                  <span className="font-medium text-gray-800">{t(m.tkey)}</span>
                </label>
              ))}
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                {t('reportar_modal.field_detail')}
              </label>
              <textarea
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
                rows={2}
                placeholder={t('reportar_modal.detail_ph')}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

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
                className="flex-1 rounded-xl bg-hospital py-2.5 font-semibold text-white disabled:opacity-60"
              >
                {sending ? t('common.sending') : t('reportar_modal.submit')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
