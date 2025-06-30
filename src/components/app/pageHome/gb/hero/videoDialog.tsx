'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Video } from '@/components/ui/video'

export function GBHeroVideoDialog({ children }: React.PropsWithChildren) {
  const [open, setOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  // Close on overlay click
  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setOpen(false)
  }, [])

  // Trap focus in modal
  useEffect(() => {
    if (!open || !modalRef.current) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    modalRef.current.focus()
    return () => {
      previouslyFocused?.focus()
    }
  }, [open])

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={handleOverlayClick}
          tabIndex={-1}
        >
          <div
            aria-modal="true"
            className="relative flex flex-col items-center justify-center bg-transparent p-0 shadow-xl outline-none"
            ref={modalRef}
            role="dialog"
            style={{ maxWidth: 768, width: '90vw', maxHeight: '90vh' }}
            tabIndex={0}
          >
            <div
              className="flex items-center justify-center"
              style={{ width: 'min(90vw, 90vh, 768px)', height: 'min(90vw, 90vh, 768px)' }}
            >
              <div className="relative">
                <button
                  aria-label="Close"
                  className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 focus:outline-none"
                  onClick={() => setOpen(false)}
                >
                  <svg
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <line x1="18" x2="6" y1="6" y2="18" />
                    <line x1="6" x2="18" y1="6" y2="18" />
                  </svg>
                </button>
                <Video
                  autoPlay
                  className="h-full w-full rounded-2xl object-contain"
                  controls
                  loop={false}
                  muted={false}
                  playsInline={false}
                  poster="/ca/home/hero-video-thumbnail.png"
                  src="https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/ca/sablecoin_hero.mp4"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
