import { generateOgImage } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/generateOgImage'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.MINUTE
export const runtime = 'edge'
export const alt = 'Who will defend crypto in America?'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default generateOgImage
