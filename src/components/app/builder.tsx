'use client'

import { ComponentProps } from 'react'
import { BuilderComponent, useIsPreviewing } from '@builder.io/react'
import DefaultErrorPage from 'next/error'

import { useHasHydrated } from '@/hooks/useHasHydrated'
import { maybeInitCMSClient } from '@/utils/web/clientCMS'

type BuilderPageProps = ComponentProps<typeof BuilderComponent>

maybeInitCMSClient()

export function RenderBuilderContent(props: BuilderPageProps) {
  const hasHydrated = useHasHydrated()

  // Call the useIsPreviewing hook to determine if
  // the page is being previewed in Builder
  const isPreviewing = useIsPreviewing()

  if (!hasHydrated) {
    return null
  }

  // If `content` has a value or the page is being previewed in Builder,
  // render the BuilderComponent with the specified content and model props.
  if (props.content || isPreviewing) {
    return <BuilderComponent {...props} />
  }
  // If the `content` is falsy and the page is
  // not being previewed in Builder, render the
  // DefaultErrorPage with a 404.
  return <DefaultErrorPage statusCode={404} />
}
