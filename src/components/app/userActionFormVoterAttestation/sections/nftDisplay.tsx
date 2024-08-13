import { LockKeyhole } from 'lucide-react'

import { NextImage } from '@/components/ui/image'
import { Video } from '@/components/ui/video'

interface NFTDisplayProps {
  locked?: boolean
}

export function NFTDisplay({ locked = false }: NFTDisplayProps) {
  return (
    <div className="relative mx-auto max-h-56 w-full max-w-96">
      {locked && (
        <>
          <div className="absolute z-50 flex h-full w-full flex-col items-center justify-center gap-2 text-white">
            <LockKeyhole size={48} />
            <p className="text-center">Pledge to unlock NFT</p>
          </div>
          <div className="absolute left-0 top-0 z-40 h-full w-full">
            <div className="h-full w-full rounded-xl bg-foreground opacity-70 backdrop-blur-sm" />
          </div>
        </>
      )}
      <Video
        className={'mx-auto h-56 w-full max-w-96 overflow-hidden rounded-xl object-cover'}
        fallback={
          <NextImage
            alt="Voter Attestation"
            height={224}
            priority
            src="/actionTypeVideos/voterAttestationBanner.png"
            width={384}
          />
        }
        src="/actionTypeVideos/voterAttestationBanner.mp4"
      />
    </div>
  )
}
