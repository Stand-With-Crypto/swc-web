export const isBrowser = typeof window !== 'undefined'

declare global {
  interface Window {
    Cypress: unknown
  }
}

export const isCypress = Boolean(
  process.env.NEXT_PUBLIC_IS_CYPRESS || (isBrowser ? window.Cypress : process.env.CYPRESS),
)
