'use client'

import type { ComponentProps } from 'react'
import { Builder, BuilderComponent, useIsPreviewing } from '@builder.io/react'
import { notFound } from 'next/navigation'

import { useSession } from '@/hooks/useSession'

type BuilderPageProps = ComponentProps<typeof BuilderComponent>

export function RenderBuilderContent(props: BuilderPageProps) {
  const session = useSession()

  const isPreviewing = useIsPreviewing()

  const builderData = {
    ...props.data,
    isAuthenticated: session.isLoggedIn,
  }

  if (props.content || isPreviewing || Builder.isEditing) {
    return <BuilderComponent {...props} data={builderData} />
  }

  return notFound()
}
