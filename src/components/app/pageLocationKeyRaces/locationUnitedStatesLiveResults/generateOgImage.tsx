/* eslint-disable @next/next/no-img-element */
// the above eslint rule is disabled because the img elements are required for the og image to work
import { ImageResponse } from 'next/og'

import { organizeRaceSpecificPeople } from '@/components/app/pageLocationKeyRaces/locationRaceSpecific/organizeRaceSpecificPeople'
import { organizeStateSpecificPeople } from '@/components/app/pageLocationKeyRaces/locationStateSpecific/organizeStateSpecificPeople'
import { DTSI_Person, DTSI_UnitedStatesPresidentialQuery } from '@/data/dtsi/generated'
import { queryDTSILocationDistrictSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationDistrictSpecificInformation'
import { queryDTSILocationStateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationStateSpecificInformation'
import { queryDTSILocationUnitedStatesPresidential } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesPresidentialInformation'
import { formatDTSIDistrictId, NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import {
  convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence,
  convertDTSIPersonStanceScoreToLetterGrade,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import { OPEN_GRAPH_IMAGE_DIMENSIONS } from '@/utils/server/generateOpenGraphImageUrl'
import { USStateCode } from '@/utils/shared/usStateUtils'

export async function generateOgImage({
  params,
}: {
  params: { stateCode?: string; district?: string }
}) {
  const { stateCode, district } = params

  let presidentialRaceData: DTSI_UnitedStatesPresidentialQuery | null = null
  let stateRaceData: ReturnType<typeof organizeStateSpecificPeople> | null = null
  let districtRaceData: ReturnType<typeof organizeRaceSpecificPeople> | null = null

  if (stateCode && district) {
    const data = await queryDTSILocationDistrictSpecificInformation({
      stateCode: stateCode as USStateCode,
      district: district as NormalizedDTSIDistrictId,
    })
    districtRaceData = organizeRaceSpecificPeople(data.people, {
      stateCode: stateCode as USStateCode,
      district: district as NormalizedDTSIDistrictId,
    })
  } else if (stateCode) {
    const data = await queryDTSILocationStateSpecificInformation({
      stateCode: stateCode as USStateCode,
    })
    stateRaceData = organizeStateSpecificPeople(data.people)
  } else {
    presidentialRaceData = await queryDTSILocationUnitedStatesPresidential()
  }

  const shieldData = await fetch(
    new URL('../../pagePoliticianDetails/images/shield.png', import.meta.url),
  ).then(res => res.arrayBuffer())
  const placeholderData = await fetch(
    new URL('../../pagePoliticianDetails/images/profile.png', import.meta.url),
  ).then(res => res.arrayBuffer())

  if (!presidentialRaceData && !stateRaceData && !districtRaceData) {
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
            <div tw="text-gray-400 text-2xl">View live election results on Stand With Crypto.</div>
          </div>
        </div>
      ),
      OPEN_GRAPH_IMAGE_DIMENSIONS,
    )
  }

  const candidateA =
    districtRaceData?.[0] ||
    stateRaceData?.senators[0] ||
    presidentialRaceData!.people.find(candidate => candidate.lastName === 'Trump') ||
    presidentialRaceData!.people[0]
  const candidateB =
    districtRaceData?.[1] ||
    stateRaceData?.senators[1] ||
    presidentialRaceData!.people.find(candidate => candidate.lastName === 'Harris') ||
    presidentialRaceData!.people[1]

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
    const letterGrade = candidate ? convertDTSIPersonStanceScoreToLetterGrade(candidate) : '?'
    switch (letterGrade) {
      case 'A':
        return await fetch(
          new URL('../../pagePoliticianDetails/images/A.png', import.meta.url),
        ).then(res => res.arrayBuffer())
      case 'B':
        return await fetch(
          new URL('../../pagePoliticianDetails/images/B-light.png', import.meta.url),
        ).then(res => res.arrayBuffer())
      case 'C':
        return await fetch(
          new URL('../../pagePoliticianDetails/images/C.png', import.meta.url),
        ).then(res => res.arrayBuffer())
      case 'D':
        return await fetch(
          new URL('../../pagePoliticianDetails/images/D-light.png', import.meta.url),
        ).then(res => res.arrayBuffer())
      case 'F':
        return await fetch(
          new URL('../../pagePoliticianDetails/images/F.png', import.meta.url),
        ).then(res => res.arrayBuffer())
      case '?':
        return await fetch(
          new URL('../../pagePoliticianDetails/images/no-grade.png', import.meta.url),
        ).then(res => res.arrayBuffer())
    }
  }

  const candidateALetterImage = await getLetterImage(candidateA)
  const candidateBLetterImage = await getLetterImage(candidateB)

  const description =
    stateCode && district
      ? `for ${stateCode} ${formatDTSIDistrictId(district as NormalizedDTSIDistrictId)} District Congressional Race`
      : stateCode
        ? `for U.S. Senate Race (${stateCode})`
        : 'for U.S. Presidential Race'

  return new ImageResponse(
    (
      <div
        style={{ background: '#000', gap: '2rem' }}
        tw="flex text-white p-8 w-full h-full flex-col items-center justify-center"
      >
        <img alt="stand with crypto shield logo" src={shieldData as any} width="48px" />

        <div tw="flex flex-col items-center text-center">
          <p tw="text-5xl font-bold mb-0">Who will defend crypto in America?</p>
          <p tw="text-3xl text-gray-400">
            View live election results {description} on Stand With Crypto.
          </p>
        </div>

        <div style={{ gap: '4rem' }} tw="flex justify-center w-full mt-4">
          {candidateA ? (
            <div tw="flex flex-col items-start text-left">
              <div tw="flex w-[175px]">
                <img
                  alt={dtsiPersonFullName(candidateA)}
                  src={candidateA.profilePictureUrl || (placeholderData as any)}
                  style={{
                    display: 'flex',
                    backgroundColor: 'gray',
                    overflow: 'hidden',
                    objectFit: 'cover',
                    width: '175px',
                    height: '175px',
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
                <span tw="text-2xl mb-2">
                  {dtsiPersonFullName(candidateA)}
                  {candidateA.politicalAffiliationCategory
                    ? ` (${
                        dtsiPersonPoliticalAffiliationCategoryAbbreviation(
                          candidateA.politicalAffiliationCategory,
                        ) ?? ''
                      })`
                    : ''}
                </span>
                <span tw="text-gray-400">{getScoreLanguage(candidateA)}</span>
              </div>
            </div>
          ) : null}

          {candidateB ? (
            <div tw="flex flex-col items-end text-right">
              <div tw="flex w-[175px]">
                <img
                  alt={dtsiPersonFullName(candidateB)}
                  src={candidateB.profilePictureUrl || (placeholderData as any)}
                  style={{
                    display: 'flex',
                    backgroundColor: 'gray',
                    overflow: 'hidden',
                    objectFit: 'cover',
                    width: '175px',
                    height: '175px',
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
                    ? ` (${
                        dtsiPersonPoliticalAffiliationCategoryAbbreviation(
                          candidateB.politicalAffiliationCategory,
                        ) ?? ''
                      })`
                    : ''}
                </span>
                <span tw="text-gray-400">{getScoreLanguage(candidateB)}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    ),
    OPEN_GRAPH_IMAGE_DIMENSIONS,
  )
}
