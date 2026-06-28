import type { Report } from '../types'
import { LAYER_BY_ID } from '../layers'

interface Props {
  report: Report
}

// Build a shareable text, a deep link to the report, and a maps location URL.
function buildShare(report: Report) {
  const tipo = LAYER_BY_ID[report.tipo].label
  const maps = `https://www.google.com/maps?q=${report.lat},${report.lng}`
  // Deep link that re-opens this exact report when the app loads.
  const link = `${window.location.origin}${window.location.pathname}?reporte=${report.id}`
  const text = `${tipo}: ${report.nombre} — vía tuAyudaVenezuela`
  return { maps, link, text }
}

export default function ShareBar({ report }: Props) {
  const { maps, link, text } = buildShare(report)
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`
  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`

  // Instagram has no web share intent — use the native share sheet (which
  // includes Instagram on mobile) or fall back to copying the link.
  async function instagram() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'tuAyudaVenezuela', text, url: link })
        return
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${link}`)
      alert('Enlace copiado. Pégalo en tu historia o publicación de Instagram.')
    } catch {
      window.open('https://instagram.com', '_blank')
    }
  }

  return (
    <div className="mt-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Compartir
      </div>
      <div className="flex items-center gap-2.5">
        <Circle href={wa} label="Compartir en WhatsApp" bg="#25D366">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden>
            <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C9.4 21 3 14.6 3 6c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z" />
          </svg>
        </Circle>
        <Circle href={x} label="Compartir en X" bg="#000000">
          <span className="text-base font-bold leading-none text-white">𝕏</span>
        </Circle>
        <Circle href={fb} label="Compartir en Facebook" bg="#1877F2">
          <span className="text-lg font-bold leading-none text-white">f</span>
        </Circle>
        <button
          onClick={instagram}
          aria-label="Compartir en Instagram"
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: 'linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)' }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none" />
          </svg>
        </button>
      </div>

      <div className="mt-3">
        <a
          href={maps}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700"
        >
          🧭 Cómo llegar
        </a>
      </div>
    </div>
  )
}

function Circle({
  href,
  label,
  bg,
  children,
}: {
  href: string
  label: string
  bg: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full"
      style={{ backgroundColor: bg }}
    >
      {children}
    </a>
  )
}
