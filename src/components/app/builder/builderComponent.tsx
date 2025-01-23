'use client'

import type { ComponentProps } from 'react'
import { Builder, BuilderComponent, useIsPreviewing } from '@builder.io/react'
import { notFound } from 'next/navigation'

import { RenderComponentModelTypes } from '@/components/app/builder/constants'

type BuilderPageProps = ComponentProps<typeof BuilderComponent> & {
  modelType: RenderComponentModelTypes
  fallback?: React.ReactNode
}

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
