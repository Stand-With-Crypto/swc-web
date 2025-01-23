import { RenderBuilderContent } from '@/components/app/builder/builderComponent'
import { RenderComponentModelTypes } from '@/components/app/builder/constants'
import { HeroImageContainer } from '@/components/app/hero/heroImage'
import { BuilderSectionModelIdentifiers } from '@/utils/server/builder/models/sections/constants'
import { getSectionContent } from '@/utils/server/builder/models/sections/utils/getSectionContent'

export async function HeroBuilder() {
  const heroContent = await getSectionContent(BuilderSectionModelIdentifiers.HERO, '/')

  return (
    <RenderBuilderContent
      content={heroContent}
      fallback={<HeroImageContainer />}
      model={BuilderSectionModelIdentifiers.HERO}
      modelType={RenderComponentModelTypes.SECTION}
    />
  )
}
