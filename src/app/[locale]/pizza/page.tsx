import { Metadata } from 'next'

import { NextImage } from '@/components/ui/image'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

import soonGif from './soon.gif'

export const dynamic = 'error'

const title = 'Coming Soon'
const description = "Who doesn't love pizza?"

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function PizzaPage() {
  return (
    <div className="container mx-auto p-6 text-center md:p-20">
      <NextImage alt="Coming soon..." {...soonGif} className="w-full" />
    </div>
  )
}
