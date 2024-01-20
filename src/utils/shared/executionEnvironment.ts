export const isBrowser = typeof window !== 'undefined'

export const isCypress =
  process.env.NEXT_PUBLIC_IS_CYPRESS || (isBrowser ? window.Cypress : process.env.CYPRESS)
