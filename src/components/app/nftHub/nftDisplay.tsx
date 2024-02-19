'use client'
import { UserActionType } from '@prisma/client'

import { SensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/constants'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { NFTSlug } from '@/utils/shared/nft'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

type NFTDisplayProps = {
  userActions: SensitiveDataClientUserAction[]
}

type NFTImages = {
  name: string
  image: string
}

const retrieveNFTEnumKey = (nftSlug: string) => {
  const nftEnumKey = null
  for (const key in NFTSlug) {
    return NFTSlug[key as keyof typeof NFTSlug] === nftSlug ? key : null
  }
  return nftEnumKey
}
const height = '335px'
const width = '335px'

const ButtonWrapper = USER_ACTION_ROW_CTA_INFO[UserActionType.NFT_MINT].WrapperComponent

export function NFTDisplay({ userActions }: NFTDisplayProps) {
  const userNfts: NFTImages[] = userActions.reduce(
    (acc: NFTImages[], action: SensitiveDataClientUserAction): NFTImages[] => {
      const nftSlug = action.nftMint?.nftSlug

      if (nftSlug) {
        const enumKey = retrieveNFTEnumKey(nftSlug)

        if (enumKey) {
          const { name, image } = NFT_CLIENT_METADATA[NFTSlug[enumKey as keyof typeof NFTSlug]]
          acc.push({ name, image: image.url })
        }
      }
      return acc
    },
    [],
  )
  const numNfts = userNfts.length

  const renderNfts = () => {
    return userNfts.map(nft => {
      return (
        <div className="overflow-hidden rounded-3xl bg-gray-100" key={nft.name}>
          <NextImage
            alt={nft.name}
            height={335}
            src={nft.image}
            style={{ borderRadius: '24px' }}
            width={335}
          />
        </div>
      )
    })
  }

  const renderEmptySpots = () => {
    const emptySpots = 3 - (numNfts % 3)
    return Array.from({ length: emptySpots }, (_, index) => (
      <div
        className="rounded-3xl bg-gray-100"
        key={index}
        style={{ height: `${height}`, width: `${width}` }}
      ></div>
    ))
  }

  return (
    <>
      <div className="flex w-full flex-row flex-wrap items-center justify-center gap-4 sm:flex-col md:flex-col lg:flex-row lg:justify-between xl:flex-row xl:justify-between">
        {renderNfts()}
        {renderEmptySpots()}
      </div>
      <div className="m-4 flex justify-center">
        <ButtonWrapper>
          <Button>Mint Stand With Crypto Supporter NFT</Button>
        </ButtonWrapper>
      </div>
    </>
  )
}
