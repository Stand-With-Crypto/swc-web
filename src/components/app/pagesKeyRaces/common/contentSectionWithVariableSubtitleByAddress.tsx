'use client'
import React from 'react'

import { ContentSection, ContentSectionProps } from '@/components/app/ContentSection'
import { GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { Skeleton } from '@/components/ui/skeleton'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'

type SubtitleState = 'loading' | 'hidden' | 'visible'

interface ContentSectionWithVariableSubtitleByAddressProps
  extends Omit<ContentSectionProps, 'children'> {
  withAddress: SubtitleState
  withoutAddress: SubtitleState
  renderContent: React.ComponentType<{ onChangeAddress: GooglePlacesSelectProps['onChange'] }>
}

export function ContentSectionWithVariableSubtitleByAddress({
  withAddress: withAddressState,
  withoutAddress: withoutAddressState,
  subtitle,
  renderContent: RenderContent,
  ...contentSectionProps
}: ContentSectionWithVariableSubtitleByAddressProps) {
  const { address } = useMutableCurrentUserAddress()
  const [subtitleState, setSubtitleState] = React.useState<SubtitleState>('loading')

  // This is necessary because `useMutableCurrentUserAddress` doesn't trigger a react rerender on change
  React.useEffect(() => {
    console.log('ContentSectionWithVariableSubtitleByAddress/useEffect', { address })
    if (address === 'loading') {
      setSubtitleState('loading')
      return
    }

    setSubtitleState(address ? withAddressState : withoutAddressState)
  }, [address, withAddressState, withoutAddressState])

  return (
    <ContentSection
      {...contentSectionProps}
      subtitle={
        subtitleState === 'hidden' ? null : <Subtitle state={subtitleState}>{subtitle}</Subtitle>
      }
    >
      <RenderContent
        onChangeAddress={newAddress => {
          setSubtitleState(newAddress ? withAddressState : withoutAddressState)
        }}
      />
    </ContentSection>
  )
}

function Subtitle({ state, children }: React.PropsWithChildren<{ state: SubtitleState }>) {
  if (state === 'loading') {
    return <Skeleton>{children}</Skeleton>
  }

  return <>{children}</>
}
