/* eslint-disable @next/next/no-img-element */
// the above eslint rule is disabled because the img elements are required for the og image to work
import { ImageResponse } from 'next/og'

import { DTSI_Person } from '@/data/dtsi/generated'
import { queryDTSILocationUnitedStatesPresidential } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesPresidentialInformation'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import {
  convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence,
  convertDTSIPersonStanceScoreToLetterGrade,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import { OPEN_GRAPH_IMAGE_DIMENSIONS } from '@/utils/server/generateOpenGraphImageUrl'

export async function generateOgImage({
  params,
}: {
  params: { stateCode?: string; district?: string }
}) {
  // const { stateCode, district } = params
  console.log('params', params)

  const presidentialRaceData = await queryDTSILocationUnitedStatesPresidential()

  const shieldData = await fetch(new URL('./images/shield.png', import.meta.url)).then(res =>
    res.arrayBuffer(),
  )
  const placeholderData = await fetch(new URL('./images/profile.png', import.meta.url)).then(res =>
    res.arrayBuffer(),
  )

  if (!presidentialRaceData) {
    return new ImageResponse(
      (
        <div tw="flex bg-black text-white p-8 w-full h-full flex-col items-center gap-8">
          <div tw="flex w-full flex-col justify-center items-center">
            <img
              alt="stand with crypto shield logo"
              src={shieldData as any}
              style={{ position: 'absolute', top: 0, right: 0 }}
              width="48px"
            />
          </div>

          <div tw="flex flex-col items-center justify-center text-center gap-2">
            <div tw="text-5xl">Who will defend crypto in America?</div>
            <div tw="text-gray-400">View live election results on Stand With Crypto.</div>
          </div>
        </div>
      ),
      OPEN_GRAPH_IMAGE_DIMENSIONS,
    )
  }

  const candidateA =
    presidentialRaceData.people.find(candidate => candidate.lastName === 'Trump') ||
    presidentialRaceData.people[0]
  const candidateB =
    presidentialRaceData.people.find(candidate => candidate.lastName === 'Harris') ||
    presidentialRaceData.people[1]

  function getScoreLanguage(
    candidate: Pick<
      DTSI_Person,
      'computedStanceScore' | 'manuallyOverriddenStanceScore' | 'computedSumStanceScoreWeight'
    >,
  ) {
    return convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence(candidate)
  }

  async function getLetterImage(
    candidate: Pick<
      DTSI_Person,
      'computedStanceScore' | 'manuallyOverriddenStanceScore' | 'computedSumStanceScoreWeight'
    >,
  ) {
    const letterGrade = convertDTSIPersonStanceScoreToLetterGrade(candidate) ?? '?'
    switch (letterGrade) {
      case 'A':
        return await fetch(new URL('./images/A.png', import.meta.url)).then(res =>
          res.arrayBuffer(),
        )
      case 'B':
        return await fetch(new URL('./images/B-light.png', import.meta.url)).then(res =>
          res.arrayBuffer(),
        )
      case 'C':
        return await fetch(new URL('./images/C.png', import.meta.url)).then(res =>
          res.arrayBuffer(),
        )
      case 'D':
        return await fetch(new URL('./images/D-light.png', import.meta.url)).then(res =>
          res.arrayBuffer(),
        )
      case 'F':
        return await fetch(new URL('./images/F.png', import.meta.url)).then(res =>
          res.arrayBuffer(),
        )
      case '?':
        return await fetch(new URL('./images/no-grade.png', import.meta.url)).then(res =>
          res.arrayBuffer(),
        )
    }
  }

  const candidateALetterImage = await getLetterImage(candidateA)
  const candidateBLetterImage = await getLetterImage(candidateB)

  return new ImageResponse(
    (
      <div
        style={{ background: '#000', gap: '2rem' }}
        tw="flex text-white p-8 w-full h-full flex-col items-center justify-around"
      >
        <img
          alt="stand with crypto shield logo"
          height="48px"
          src={shieldData as any}
          style={{
            backgroundColor: 'blue',
            height: '48px',
            width: '48px',
          }}
          width="48px"
        />

        <div tw="flex flex-col items-center text-center">
          <p tw="text-3xl font-semibold mb-0">Who will defend crypto in America?</p>
          <p tw="text-xl text-gray-400">View live election results on Stand With Crypto.</p>
        </div>

        <div style={{ gap: '2rem' }} tw="flex justify-around w-full border-4 border-red-500">
          <div tw="flex flex-col items-start text-left border-2 flex-1 max-w-sm border-blue-500">
            <div tw="flex w-[125px]">
              <img
                alt={dtsiPersonFullName(candidateA)}
                src={candidateA.profilePictureUrl || (placeholderData as any)}
                style={{
                  display: 'flex',
                  backgroundColor: 'gray',
                  overflow: 'hidden',
                  objectFit: 'cover',
                  width: '125px',
                  height: '125px',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                tw="rounded-md"
              />
              <img
                alt="politician stance on crypto"
                src={candidateALetterImage as any}
                tw="-bottom-4 -right-4 absolute h-10 w-10 rounded-full"
              />
            </div>

            <div tw="flex-col mt-8 flex items-start">
              <span tw="text-2xl mb-2 ">
                {dtsiPersonFullName(candidateA)}
                {candidateA.politicalAffiliationCategory
                  ? `(${
                      dtsiPersonPoliticalAffiliationCategoryAbbreviation(
                        candidateA.politicalAffiliationCategory,
                      ) ?? ''
                    })`
                  : ''}
              </span>
              <span tw="text-gray-400">{getScoreLanguage(candidateA)}</span>
            </div>
          </div>

          <div tw="flex flex-col items-end text-right border-2 flex-1 max-w-sm border-green-500">
            <div tw="flex w-[125px]">
              <img
                alt={dtsiPersonFullName(candidateB)}
                src={candidateB.profilePictureUrl || (placeholderData as any)}
                style={{
                  display: 'flex',
                  backgroundColor: 'gray',
                  overflow: 'hidden',
                  objectFit: 'cover',
                  width: '125px',
                  height: '125px',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                tw="rounded-md"
              />
              <img
                alt="politician stance on crypto"
                src={candidateBLetterImage as any}
                style={{
                  background: 'red',
                }}
                tw="-bottom-4 -right-4 absolute h-10 w-10 rounded-full"
              />
            </div>
            <div tw="flex-col mt-8 flex items-end">
              <span tw="text-2xl mb-2">
                {dtsiPersonFullName(candidateB)}
                {candidateB.politicalAffiliationCategory
                  ? `(${
                      dtsiPersonPoliticalAffiliationCategoryAbbreviation(
                        candidateB.politicalAffiliationCategory,
                      ) ?? ''
                    })`
                  : ''}
              </span>
              <span tw="text-gray-400">{getScoreLanguage(candidateB)}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    OPEN_GRAPH_IMAGE_DIMENSIONS,
  )
}
