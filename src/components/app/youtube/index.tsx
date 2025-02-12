'use client'

import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

import LiteYouTubeEmbed from 'react-lite-youtube-embed'

import { useCookieConsent } from '@/components/app/cookieConsent/useCookieConsent'

interface Props {
  videoId: string
  title: string
  allowFullScreen?: boolean
  autoplay?: boolean
  muted?: boolean
}

export function YouTube({ videoId, title, allowFullScreen, autoplay, muted, ...props }: Props) {
  const { acceptedCookies } = useCookieConsent()

  const params = {
    fs: allowFullScreen ? '1' : '0',
    autoplay: autoplay ? '1' : '0',
  }

  return (
    <div {...props}>
      <LiteYouTubeEmbed
        cookie={acceptedCookies}
        id={videoId}
        muted={muted}
        params={new URLSearchParams(params).toString()}
        title={title}
      />
    </div>
  )
}
