'use client'

export function useUrlHash() {
  return typeof window !== 'undefined'
    ? decodeURIComponent(window.location.hash.replace('#', ''))
    : null
}
