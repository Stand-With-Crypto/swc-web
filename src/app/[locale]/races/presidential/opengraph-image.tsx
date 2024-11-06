import { generateOgImage } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/generateOgImage'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.MINUTE
export const alt = 'Donald Trump vs Kamala Harris'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default generateOgImage
