import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

import {
  OPEN_GRAPH_IMAGE_DIMENSIONS,
  OpenGraphImageOptions,
} from '@/utils/server/generateOpenGraphImageUrl'
import { decodeObjectForUrl } from '@/utils/shared/encodeObjectForUrl'

export const dynamic = 'error'
export const revalidate = 60 * 60 * 24 * 7 // 1 week

export async function GET(_request: NextRequest, { params }: { params: { config: string } }) {
  const config = decodeObjectForUrl<OpenGraphImageOptions>(params.config)
  return new ImageResponse(
    (
      // LATER-TASK style this based off design guidance
      <div
        style={{
          fontSize: 40,
          color: 'black',
          background: 'white',
          width: '100%',
          height: '100%',
          padding: '50px 200px',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
        }}
      >
        {config.title} - {config.description}
      </div>
    ),
    OPEN_GRAPH_IMAGE_DIMENSIONS,
  )
}
