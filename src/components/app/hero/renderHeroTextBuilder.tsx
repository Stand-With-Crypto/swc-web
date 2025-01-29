import { Content } from '@builder.io/react'

import { RenderBuilderContent } from '@/components/app/builder/builderComponent'
import { RenderComponentModelTypes } from '@/components/app/builder/constants'
import { BuilderSectionModelIdentifiers } from '@/utils/server/builder/models/sections/constants'

export async function HeroTextBuilder({ content }: { content: Content }) {
  return (
    <RenderBuilderContent
      content={content}
      model={BuilderSectionModelIdentifiers.HERO_TEXT}
      modelType={RenderComponentModelTypes.SECTION}
    />
  )
}
