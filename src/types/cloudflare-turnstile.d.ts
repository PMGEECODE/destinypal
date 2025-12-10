// Cloudflare Turnstile global type declarations
declare global {
  interface Window {
    turnstile?: TurnstileInstance
  }
}

export interface TurnstileInstance {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
  getResponse: (widgetId: string) => string | undefined
}

export interface TurnstileRenderOptions {
  sitekey: string
  callback?: (token: string) => void
  "error-callback"?: () => void
  "expired-callback"?: () => void
  theme?: "light" | "dark" | "auto"
  size?: "normal" | "compact"
  tabindex?: number
  action?: string
  cData?: string
  "response-field"?: boolean
  "response-field-name"?: string
}
