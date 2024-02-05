'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/ui/link'
import { actionCreateCoinbaseCommerceCharge } from '@/actions/actionCreateCoinbaseCommerceCharge'

export function DonateButton() {
  const [url, setUrl] = useState('#')
  const fetchUrl = async () => {
    const responseUrl = await actionCreateCoinbaseCommerceCharge()
    setUrl(responseUrl)
  }
  const handleClick = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    window.open(url, '_blank')
  }
  useEffect(() => {
    fetchUrl()
  }, [])
  return (
    <div className="flex justify-center">
      <Button size="lg" asChild>
        <ExternalLink href={url} onClick={handleClick}>
          Donate
        </ExternalLink>
      </Button>
    </div>
  )
}
