/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'

import { getData } from '@/app/[locale]/politicians/person/[dtsiSlug]/getData'
import { getBgHexColor } from '@/components/app/dtsiFormattedLetterGrade'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import {
  convertDTSIStanceScoreToCryptoSupportLanguageSentence,
  convertDTSIStanceScoreToLetterGrade,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
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
  const imageData = await fetch(new URL('./shield.png', import.meta.url)).then(res =>
    res.arrayBuffer(),
  )
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

  const scoreLanguage = convertDTSIStanceScoreToCryptoSupportLanguageSentence(person)
  const letterGrade = convertDTSIStanceScoreToLetterGrade(person)
  const dimensions = person.profilePictureUrlDimensions as
    | { width: number; height: number }
    | undefined
  const circleColor = getBgHexColor(letterGrade)
  const isLetterGrade = letterGrade ?? '?'

  let letterPadding = {}
  switch (isLetterGrade) {
    case 'A':
      letterPadding = { paddingBottom: '10px' }
      break
    case 'B':
      break
    case 'C':
      letterPadding = { paddingBottom: '3px', paddingRight: '5px' }
      break
    case 'D':
      letterPadding = { paddingBottom: '3px', paddingLeft: '3px' }
      break
    case 'F':
      letterPadding = { paddingRight: '3px' }
      break
    case '?':
      letterPadding = { paddingLeft: '3px' }
  }

  return new ImageResponse(
    (
      <div
        style={{ background: '#000' }}
        tw="flex text-white p-8 w-full h-full flex-col justify-between items-center"
      >
        <div tw="flex p-8 w-full flex-col justify-between items-center">
          <img
            src={imageData as any}
            style={{ position: 'absolute', top: 0, right: 0 }}
            width="48px"
          />
        </div>
        <div />
        <div tw="w-full flex flex-col text-center justify-center items-center">
          {person.profilePictureUrl && dimensions ? (
            <div
              style={{
                display: 'flex',
                paddingLeft: '60px',
              }}
            >
              <img
                alt={dtsiPersonFullName(person)}
                src={person.profilePictureUrl}
                style={{
                  borderRadius: '50%',
                  overflow: 'hidden',
                  objectFit: 'cover',
                  width: '200px',
                  height: '200px',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  position: 'relative',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: `${circleColor}`,
                  top: '140px',
                  right: '80px',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <p
                  style={{
                    textAlign: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    fontSize: '50px',
                    fontWeight: 900,
                    lineHeight: 1,
                    color: 'white',
                    ...letterPadding,
                  }}
                >
                  {isLetterGrade}
                </p>
              </div>
            </div>
          ) : null}
          <div tw="flex-col text-xl mb-2 mt-8 flex text-gray-400 justify-center items-center">
            <span tw="text-white mx-2 text-[40px] leading-[48px] pb-4">
              {dtsiPersonFullName(person)}
            </span>
            <br />
            {scoreLanguage}
          </div>
        </div>
        <div tw="text-gray-400">standwithcrypto.org</div>
      </div>
    ),
    OPEN_GRAPH_IMAGE_DIMENSIONS,
  )
}
