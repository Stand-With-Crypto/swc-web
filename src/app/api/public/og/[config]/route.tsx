import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

import {
  OPEN_GRAPH_IMAGE_DIMENSIONS,
  OpenGraphImageOptions,
} from '@/utils/server/generateOpenGraphImageUrl'
import { decodeObjectForUrl } from '@/utils/shared/encodeObjectForUrl'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'
export const runtime = 'edge'

export async function GET(_request: NextRequest, props: { params: Promise<{ config: string }> }) {
  const params = await props.params
  const imageData = await fetch(new URL('./shield.png', import.meta.url)).then(res =>
    res.arrayBuffer(),
  )
  const { title, description } = decodeObjectForUrl<OpenGraphImageOptions>(params.config)
  return new ImageResponse(
    (
      <div
        style={{ background: 'linear-gradient(180deg, #2d0075 0%, #000 100%)' }}
        tw="flex text-white p-8 w-full h-full flex-col justify-between items-center"
      >
        <div />
        <div tw="flex flex-col items-center text-center">
          {/* eslint-disable-next-line */}
          <img height="256" src={imageData as any} width="256" />
          <div tw="text-5xl mb-2 mt-8">{title}</div>
          <div tw="text-2xl text-gray-400">{description}</div>
        </div>
        <div tw="text-gray-400">standwithcrypto.org</div>
      </div>
    ),
    OPEN_GRAPH_IMAGE_DIMENSIONS,
  )
}
