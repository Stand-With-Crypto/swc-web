'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

import { Video } from '@/components/ui/video'

export function GBHeroVideoDialog({ children }: React.PropsWithChildren) {
  const [open, setOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useManualDialogEffects({ open, setOpen, modalRef })

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setOpen(false)
    }
  }, [])

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
            className="relative flex max-h-[90vh] w-[90vw] max-w-[768px] flex-col items-center justify-center bg-transparent p-0 shadow-xl outline-none"
            ref={modalRef}
            role="dialog"
            tabIndex={0}
          >
            <div
              className="flex items-center justify-center"
              // Arbitrary tailwind values do not work here, so we need to use inline styles
              style={{ width: 'min(90vw, 90vh, 768px)', height: 'min(90vw, 90vh, 768px)' }}
            >
              <div className="relative">
                <button
                  aria-label="Close"
                  className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 focus:outline-none"
                  onClick={() => setOpen(false)}
                >
                  <X size={20} />
                  <span className="sr-only">Close</span>
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

function useManualDialogEffects({
  open,
  setOpen,
  modalRef,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  modalRef: React.RefObject<HTMLDivElement | null>
}) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, setOpen])

  // Trap focus
  useEffect(() => {
    if (!open || !modalRef.current) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    modalRef.current.focus()
    return () => {
      previouslyFocused?.focus()
    }
  }, [open, modalRef])
}
