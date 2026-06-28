import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'es', flag: '🇻🇪', label: 'Español' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = LANGS.find((l) => l.code === i18n.language) ?? LANGS[0]

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function select(code: string) {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
        aria-label="Change language"
      >
        <span>{current.flag}</span>
        <span className="hidden text-xs font-medium sm:inline">{current.label}</span>
        <span className="text-[9px] text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => select(l.code)}
              className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                l.code === i18n.language
                  ? 'bg-gray-50 font-semibold text-brand'
                  : 'text-gray-700'
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span>{l.label}</span>
              {l.code === i18n.language && (
                <span className="ml-auto text-brand">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
