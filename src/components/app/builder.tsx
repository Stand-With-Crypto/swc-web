'use client'

import '@/utils/web/builder/registerComponents'

import { ComponentProps } from 'react'
import { BuilderComponent, useIsPreviewing } from '@builder.io/react'
import { notFound } from 'next/navigation'

import { maybeInitCMSClient } from '@/utils/web/builder/clientCMS'

maybeInitCMSClient()

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
