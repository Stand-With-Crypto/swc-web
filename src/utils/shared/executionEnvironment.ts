export const isBrowser = typeof window !== 'undefined'

declare global {
  interface Window {
    Cypress: unknown
  }
}

export const isCypress = Boolean(
  process.env.NEXT_PUBLIC_IS_CYPRESS || (isBrowser ? window.Cypress : process.env.CYPRESS),
)

export const isStorybook = Boolean(process.env.STORYBOOK)

export const isJest = typeof jest !== 'undefined'

export const IS_DEVELOPING_OFFLINE = process.env.IS_DEVELOPING_OFFLINE
