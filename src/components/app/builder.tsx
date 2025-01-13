'use client'

import { ComponentProps } from 'react'
import { BuilderComponent, useIsPreviewing } from '@builder.io/react'
import { notFound } from 'next/navigation'

import { maybeInitCMSClient } from '@/utils/web/builder/clientCMS'

type BuilderPageProps = ComponentProps<typeof BuilderComponent>

maybeInitCMSClient()

export function RenderBuilderContent(props: BuilderPageProps) {
  const isPreviewing = useIsPreviewing()

  if (props.content || isPreviewing) {
    return <BuilderComponent {...props} />
  }

  return notFound()
}
