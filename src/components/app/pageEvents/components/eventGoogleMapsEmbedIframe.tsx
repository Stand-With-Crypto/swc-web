import { memo } from 'react'
import { GoogleMapsEmbed } from '@next/third-parties/google'

import { useIsMobile } from '@/hooks/useIsMobile'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY,
  'NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY',
)

// This component is memoized because it was blinking on rerender.
export const GoogleMapsEmbedIFrame = memo(({ address }: { address: string }) => {
  const isMobile = useIsMobile()
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1280
  const width = isMobile ? windowWidth - 48 : 466

  return (
    <div className="flex items-center justify-center">
      <GoogleMapsEmbed
        apiKey={NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY}
        height={420}
        mode="place"
        q={address.replace(' ', '+')}
        width={width}
      />
    </div>
  )
})

GoogleMapsEmbedIFrame.displayName = 'GoogleMapsEmbedIFrame'
