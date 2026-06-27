declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined

export const RECAPTCHA_ENABLED = Boolean(SITE_KEY)

let loaded = false

function loadScript(): Promise<void> {
  if (loaded || typeof document === 'undefined') return Promise.resolve()
  loaded = true
  return new Promise((resolve) => {
    const s = document.createElement('script')
    s.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    s.onload = () => resolve()
    document.head.appendChild(s)
  })
}

export async function getRecaptchaToken(action = 'submit'): Promise<string | null> {
  if (!RECAPTCHA_ENABLED) return null
  await loadScript()
  return new Promise((resolve) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(SITE_KEY!, { action })
        .then(resolve)
        .catch(() => resolve(null))
    })
  })
}
