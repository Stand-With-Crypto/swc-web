'use client'

import type { ComponentProps } from 'react'
import { Builder, BuilderComponent } from '@builder.io/react'
import { notFound } from 'next/navigation'

import { useSession } from '@/hooks/useSession'
import { BuilderState } from '@/utils/web/builder/types'

type BuilderPageProps = ComponentProps<typeof BuilderComponent>

export function RenderBuilderContent(props: BuilderPageProps) {
  const session = useSession()

  const builderData: BuilderState = {
    isAuthenticated: session.isLoggedIn,
  }

  if (props.content || Builder.isEditing) {
    return <BuilderComponent {...props} data={builderData} />
  }

  return notFound()
}
