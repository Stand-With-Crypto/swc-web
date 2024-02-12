'use client'

import { UserActionFormNFTMintDialog } from '@/components/app/userActionFormNFTMint/dialog'
import { Button } from '@/components/ui/button'

export function MintingAnNFTButton() {
  return (
    <UserActionFormNFTMintDialog>
      <Button className="p-0 underline" variant="link">
        minting an NFT
      </Button>
    </UserActionFormNFTMintDialog>
  )
}
