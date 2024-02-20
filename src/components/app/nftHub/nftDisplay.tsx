'use client'
import { UserActionType } from '@prisma/client'

import { SensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/constants'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

type NFTDisplayProps = {
  userActions: SensitiveDataClientUserAction[]
}

type NFTImages = {
  name: string
  image: string
  width: number
  height: number
}

const HEIGHT = '335px'
const WIDTH = '335px'

const ButtonWrapper = USER_ACTION_ROW_CTA_INFO[UserActionType.NFT_MINT].WrapperComponent

export function NFTDisplay({ userActions }: NFTDisplayProps) {
  let optInNftButton = true
  const userNfts: NFTImages[] = userActions.reduce(
    (acc: NFTImages[], action: SensitiveDataClientUserAction): NFTImages[] => {
      const nftSlug = action.nftMint?.nftSlug

      if (nftSlug) {
        const { name, image } = NFT_CLIENT_METADATA[nftSlug as keyof typeof NFT_CLIENT_METADATA]
        acc.push({ name, image: image.url, width: image.width, height: image.height })
      }

      if (nftSlug === 'swc-shield' && optInNftButton) optInNftButton = false

      return acc
    },
    [],
  )
  const numNfts = userNfts.length

  const renderNfts = () => {
    return userNfts.map(nft => {
      const { name, height, width, image } = nft
      return (
        <NextImage
          alt={name}
          height={height}
          key={name}
          src={image}
          style={{ borderRadius: '24px' }}
          width={width}
        />
      )
    })
  }

  const renderEmptySpots = () => {
    const emptySpots = 3 - (numNfts % 3)
    return Array.from({ length: emptySpots }, (_, index) => (
      <div
        className="shrink rounded-3xl bg-gray-100"
        key={index}
        style={{ width: `${WIDTH}`, height: `${HEIGHT}` }}
      ></div>
    ))
  }

  return (
    <>
      <div className="w-full flex-wrap items-center justify-center gap-4 sm:flex-col lg:max-h-[335px] lg:flex-row lg:justify-between">
        {renderNfts()}
        {renderEmptySpots()}
      </div>
      {optInNftButton ?? (
        <div className="m-4 flex justify-center">
          <ButtonWrapper>
            <Button>Mint Stand With Crypto Supporter NFT</Button>
          </ButtonWrapper>
        </div>
      )}
    </>
  )
}
