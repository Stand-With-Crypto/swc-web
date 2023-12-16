'use client'

import { ConnectWallet } from '@thirdweb-dev/react'

export function NavbarSessionButtonClient() {
  return <ConnectWallet theme={'dark'} auth={{ loginOptional: false }} modalSize={'compact'} />
}
