'use client'

import type { ComponentProps } from 'react'
import { BuilderComponent, useIsPreviewing } from '@builder.io/react'
import { notFound } from 'next/navigation'

type BuilderPageProps = ComponentProps<typeof BuilderComponent> & {
  type: 'section' | 'page'
}

export function RenderBuilderContent(props: BuilderPageProps) {
  const isPreviewing = useIsPreviewing()

  if (props.content || isPreviewing) {
    return <BuilderComponent {...props} />
  }

  if (props.type === 'section') {
    return null
  }

  return notFound()
}
