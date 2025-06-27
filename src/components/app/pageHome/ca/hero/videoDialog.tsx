'use client'

import React from 'react'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Video } from '@/components/ui/video'

export function CaHeroVideoDialog({ children }: React.PropsWithChildren) {
  return (
    <Dialog analytics="Hero Announcement card video dialog">
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        a11yTitle="Hero Announcement card video dialog"
        className="flex !h-full w-full max-w-3xl flex-col items-center justify-center"
        padding={false}
      >
        <Video
          autoPlay={false}
          className="h-full w-[768px]"
          controls={true}
          loop={false}
          muted={false}
          playsInline={false}
          poster="/ca/home/hero-video-thumbnail.png"
          src="https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/ca/sablecoin_hero.mp4"
        />
      </DialogContent>
    </Dialog>
  )
}
