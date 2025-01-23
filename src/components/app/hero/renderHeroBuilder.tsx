import { Content } from '@builder.io/react'

import { RenderBuilderContent } from '@/components/app/builder/builderComponent'
import { RenderComponentModelTypes } from '@/components/app/builder/constants'
import { HeroImageContainer } from '@/components/app/hero/heroImage'
import { BuilderSectionModelIdentifiers } from '@/utils/server/builder/models/sections/constants'

export function HeroBuilder({ content }: { content: Content }) {
  return (
    <RenderBuilderContent
      content={content}
      fallback={<HeroImageContainer />}
      model={BuilderSectionModelIdentifiers.HERO}
      modelType={RenderComponentModelTypes.SECTION}
    />
  )
}
