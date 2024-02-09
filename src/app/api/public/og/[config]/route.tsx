import {
  OPEN_GRAPH_IMAGE_DIMENSIONS,
  OpenGraphImageOptions,
} from '@/utils/server/generateOpenGraphImageUrl'
import { decodeObjectForUrl } from '@/utils/shared/encodeObjectForUrl'
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const dynamic = 'error'
export const revalidate = 60 * 60 * 24 * 7 // 1 week

export async function GET(_request: NextRequest, { params }: { params: { config: string } }) {
  const config = decodeObjectForUrl<OpenGraphImageOptions>(params.config)
  return new ImageResponse(
    (
      // LATER-TASK style this based off design guidance
      <div
        style={{
          alignItems: 'center',
          background: 'white',
          color: 'black',
          display: 'flex',
          fontSize: 40,
          height: '100%',
          justifyContent: 'center',
          padding: '50px 200px',
          textAlign: 'center',
          width: '100%',
        }}
      >
        {config.title} - {config.description}
      </div>
    ),
    OPEN_GRAPH_IMAGE_DIMENSIONS,
  )
}
