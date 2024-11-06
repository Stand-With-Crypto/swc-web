import { generateOgImage } from '@/components/app/pagePoliticianDetails/generateOgImage'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.HOUR
export const alt = 'Image of politician and their stance on crypto'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default generateOgImage
