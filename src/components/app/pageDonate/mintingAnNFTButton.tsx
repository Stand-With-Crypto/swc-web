'use client'

import { LazyUserActionFormNFTMint } from '@/components/app/userActionFormNFTMint/lazyLoad'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'

export function MintingAnNFTButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="p-0" variant="link">
          minting an NFT
        </Button>
      </DialogTrigger>
      <DialogContent>
        <LazyUserActionFormNFTMint />
      </DialogContent>
    </Dialog>
  )
}
