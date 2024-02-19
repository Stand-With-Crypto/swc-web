import { ImageResponse } from 'next/og'

import { getData } from '@/app/[locale]/politicians/person/[dtsiSlug]/getData'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { OPEN_GRAPH_IMAGE_DIMENSIONS } from '@/utils/server/generateOpenGraphImageUrl'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.HOUR
export const runtime = 'edge'
export const alt = 'Image of politician and their stance on crypto'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: { dtsiSlug: string } }) {
  const person = await getData(params.dtsiSlug)
  if (!person) {
    return new ImageResponse(
      (
        <div
          style={{ background: 'linear-gradient(180deg, #001C56 0%, #000 100%)' }}
          tw="flex text-white p-8 w-full h-full flex-col justify-between items-center"
        >
          <div />
          <div tw="flex flex-col items-center text-center">
            <div tw="text-5xl mb-2 mt-8">See where this politician stands on crypto</div>
          </div>
          <div tw="text-gray-400">standwithcrypto.org</div>
        </div>
      ),
      OPEN_GRAPH_IMAGE_DIMENSIONS,
    )
  }
  const dimensions = person.profilePictureUrlDimensions as
    | { width: number; height: number }
    | undefined
  return new ImageResponse(
    (
      <div
        style={{ background: 'linear-gradient(180deg, #001C56 0%, #000 100%)' }}
        tw="flex text-white p-8 w-full h-full flex-col justify-between items-center"
      >
        <div />
        <div tw="flex flex-col items-center text-center">
          {person.profilePictureUrl && dimensions ? (
            /* eslint-disable-next-line */
            <img
              height="256"
              src={person.profilePictureUrl}
              tw="rounded-3xl"
              width={`${256 * (dimensions.width / dimensions.height)}`}
            />
          ) : null}
          <div tw="text-5xl mb-2 mt-8 flex text-gray-400">
            See where <span tw="text-white inline-block mx-2">{dtsiPersonFullName(person)}</span>{' '}
            stands on crypto
          </div>
        </div>
        <div tw="text-gray-400">standwithcrypto.org</div>
      </div>
    ),
    OPEN_GRAPH_IMAGE_DIMENSIONS,
  )
}
