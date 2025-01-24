import { RenderBuilderContent } from '@/components/app/builder'
import { RenderComponentModelTypes } from '@/components/app/builder/constants'
import { NavBarGlobalBanner } from '@/components/app/navbarGlobalBanner'
import { BuilderSectionModelIdentifiers } from '@/utils/server/builder/models/sections/constants'
import { getSectionContent } from '@/utils/server/builder/models/sections/utils/getSectionContent'

export async function NavBarGlobalBannerBuilder() {
  // this is meant to be a global banner that is displayed on all pages, therefore no need to pass in pathname
  // if we ever want to differentiate between pages, we will need to pass in the pathname to the getSectionContent function
  const bannerContent = await getSectionContent(BuilderSectionModelIdentifiers.BANNER)

  return (
    <RenderBuilderContent
      content={bannerContent}
      fallback={<NavBarGlobalBanner />}
      model={BuilderSectionModelIdentifiers.BANNER}
      modelType={RenderComponentModelTypes.SECTION}
    />
  )
}
