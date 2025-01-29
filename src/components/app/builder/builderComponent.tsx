'use client'

import '@/utils/web/builder/registerComponents'

import type { ComponentProps } from 'react'
import { Builder, BuilderComponent } from '@builder.io/react'
import { notFound } from 'next/navigation'

import { RenderComponentModelTypes } from '@/components/app/builder/constants'
import { useSession } from '@/hooks/useSession'
import { maybeInitBuilderReactClient } from '@/utils/web/builder/maybeInitBuilderReactClient'
import { BuilderState } from '@/utils/web/builder/types'

maybeInitBuilderReactClient()

type BuilderPageProps = ComponentProps<typeof BuilderComponent> & {
  modelType: RenderComponentModelTypes
}

export function RenderBuilderContent(props: BuilderPageProps) {
  const session = useSession()

  const builderData: BuilderState = {
    // This prop should only be used in the context of the Builder.io editor when editing or previewing
    // We should never use it for the actual rendering of the component
    isAuthenticated: session.isLoggedIn,
  }

  if (props.content || Builder.isEditing) {
    return <BuilderComponent {...props} data={builderData} />
  }

  if (props.modelType === RenderComponentModelTypes.PAGE) {
    return notFound()
  }

  return null
}
