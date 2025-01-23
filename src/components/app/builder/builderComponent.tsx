'use client'

import '@/utils/web/builder/registerComponents'

import type { ComponentProps } from 'react'
import { Builder, BuilderComponent, useIsPreviewing } from '@builder.io/react'
import { notFound } from 'next/navigation'

import { RenderComponentModelTypes } from '@/components/app/builder/constants'
import { maybeInitBuilderReactClient } from '@/utils/web/builder/maybeInitBuilderReactClient'

type BuilderPageProps = ComponentProps<typeof BuilderComponent> & {
  modelType: RenderComponentModelTypes
  fallback?: React.ReactNode
}

maybeInitBuilderReactClient()

export function RenderBuilderContent(props: BuilderPageProps) {
  const isPreviewing = useIsPreviewing()

  if (props.content || isPreviewing || Builder.isEditing) {
    return <BuilderComponent {...props} />
  }

  if (props.modelType === RenderComponentModelTypes.PAGE) {
    return notFound()
  }

  if (props.fallback) {
    return props.fallback
  }

  return null
}
