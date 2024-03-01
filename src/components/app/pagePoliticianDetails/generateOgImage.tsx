import { ImageResponse } from 'next/og'

import { getData } from '@/app/[locale]/politicians/person/[dtsiSlug]/getData'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { OPEN_GRAPH_IMAGE_DIMENSIONS } from '@/utils/server/generateOpenGraphImageUrl'
import {
  convertDTSIStanceScoreToCryptoSupportLanguageSentence,
  convertDTSIStanceScoreToLetterGrade,
} from '@/utils/dtsi/dtsiStanceScoreUtils'

export async function generateOgImage({ params }: { params: { dtsiSlug: string } }) {
  const person = await getData(params.dtsiSlug)
  const shieldData = await fetch(new URL('./images/shield.png', import.meta.url)).then(res =>
    res.arrayBuffer(),
  )
  const placeholderData = await fetch(new URL('./images/profile.png', import.meta.url)).then(res =>
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
  const letterGrade = convertDTSIStanceScoreToLetterGrade(person) ?? '?'
  let letterImage

  switch (letterGrade) {
    case 'A':
      letterImage = await fetch(new URL('./images/A.png', import.meta.url)).then(res =>
        res.arrayBuffer(),
      )
      break
    case 'B':
      letterImage = await fetch(new URL('./images/B.png', import.meta.url)).then(res =>
        res.arrayBuffer(),
      )
      break
    case 'C':
      letterImage = await fetch(new URL('./images/C.png', import.meta.url)).then(res =>
        res.arrayBuffer(),
      )
      break
    case 'D':
      letterImage = await fetch(new URL('./images/D.png', import.meta.url)).then(res =>
        res.arrayBuffer(),
      )
      break
    case 'F':
      letterImage = await fetch(new URL('./images/F.png', import.meta.url)).then(res =>
        res.arrayBuffer(),
      )
      break
    case '?':
      letterImage = await fetch(new URL('./images/no-grade.png', import.meta.url)).then(res =>
        res.arrayBuffer(),
      )
  }

  const scoreLanguage = convertDTSIStanceScoreToCryptoSupportLanguageSentence(person)

  return new ImageResponse(
    (
      <div
        style={{ background: '#000' }}
        tw="flex text-white p-8 w-full h-full flex-col justify-between items-center"
      >
        <div tw="flex p-8 w-full flex-col justify-between items-center">
          <img
            src={shieldData as any}
            style={{ position: 'absolute', top: 0, right: 0 }}
            width="48px"
          />
        </div>
        <div />
        <div tw="w-full flex flex-col text-center justify-center items-center">
          {person.profilePictureUrl ? (
            <div
              style={{
                display: 'flex',
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
              <img
                alt="politician stance on crypto"
                src={letterImage as any}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '60px',
                }}
              />
            </div>
          ) : (
            <div tw="flex">
              <div
                style={{
                  display: 'flex',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  overflow: 'hidden',
                  objectFit: 'cover',
                  width: '200px',
                  height: '200px',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <img
                  alt={dtsiPersonFullName(person)}
                  src={placeholderData as any}
                  style={{
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    overflow: 'hidden',
                    objectFit: 'cover',
                    width: '100px',
                    height: '100px',
                  }}
                />
              </div>
              <img
                alt="politician stance on crypto"
                src={letterImage as any}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '60px',
                }}
              />
            </div>
          )}
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
