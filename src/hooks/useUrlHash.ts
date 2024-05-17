'use client'

export function useUrlHash() {
  return window ? decodeURIComponent(window.location.hash.replace('#', '')) : ''
}
