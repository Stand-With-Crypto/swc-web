import { generateOgImage } from '@/components/app/pagePoliticianDetails/generateOgImage'

export const dynamic = 'error'
export const runtime = 'edge'
export const alt = 'Image of politician and their stance on crypto'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default generateOgImage
