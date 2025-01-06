'use client'

import { ComponentProps } from 'react'
import { BuilderComponent, useIsPreviewing } from '@builder.io/react'
import { notFound } from 'next/navigation'

import { useHasHydrated } from '@/hooks/useHasHydrated'
import { maybeInitCMSClient } from '@/utils/web/builder/clientCMS'

type BuilderPageProps = ComponentProps<typeof BuilderComponent>

maybeInitCMSClient()

export function RenderBuilderContent(props: BuilderPageProps) {
  const hasHydrated = useHasHydrated()
  const isPreviewing = useIsPreviewing()

  if (!hasHydrated) {
    return null
  }

  if (props.content || isPreviewing) {
    return <BuilderComponent {...props} />
  }

  return notFound()
}
