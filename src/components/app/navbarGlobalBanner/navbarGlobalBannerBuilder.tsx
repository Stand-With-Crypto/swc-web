import { Content } from '@builder.io/react'

import { RenderBuilderContent } from '@/components/app/builder'
import { RenderComponentModelTypes } from '@/components/app/builder/constants'
import { NavBarGlobalBanner } from '@/components/app/navbarGlobalBanner'
import { BuilderSectionModelIdentifiers } from '@/utils/server/builder/models/sections/constants'

export async function NavBarGlobalBannerBuilder({ content }: { content: Content }) {
  return (
    <RenderBuilderContent
      content={content}
      fallback={<NavBarGlobalBanner />}
      model={BuilderSectionModelIdentifiers.BANNER}
      modelType={RenderComponentModelTypes.SECTION}
    />
  )
}
