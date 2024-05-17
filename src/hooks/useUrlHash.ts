'use client'

export function useUrlHash() {
  return decodeURIComponent(window.location.hash.replace('#', ''))
}
