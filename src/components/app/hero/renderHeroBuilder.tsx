'use client'

import { Content } from '@builder.io/react'

import { RenderBuilderContent } from '@/components/app/builder/builderComponent'
import { RenderComponentModelTypes } from '@/components/app/builder/constants'
import { BuilderSectionModelIdentifiers } from '@/utils/server/builder/models/sections/constants'
import { maybeInitBuilderReactClient } from '@/utils/web/builder'

maybeInitBuilderReactClient()

export function HeroBuilder({ content }: { content: Content }) {
  return (
    <RenderBuilderContent
      content={content}
      model={BuilderSectionModelIdentifiers.HERO}
      modelType={RenderComponentModelTypes.SECTION}
    />
  )
}
