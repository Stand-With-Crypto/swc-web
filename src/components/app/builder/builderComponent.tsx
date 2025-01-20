'use client'

import type { ComponentProps } from 'react'
import { Builder, BuilderComponent, useIsPreviewing } from '@builder.io/react'
import { notFound } from 'next/navigation'

type BuilderPageProps = ComponentProps<typeof BuilderComponent>

export function RenderBuilderContent(props: BuilderPageProps) {
  const isPreviewing = useIsPreviewing()

  if (props.content || isPreviewing || Builder.isEditing) {
    return <BuilderComponent {...props} />
  }

  return notFound()
}
