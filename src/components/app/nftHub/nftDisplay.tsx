'use client'
import * as Sentry from '@sentry/nextjs'

import { SensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { UserActionFormNFTMintDialog } from '@/components/app/userActionFormNFTMint/dialog'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { NFTSlug } from '@/utils/shared/nft'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

interface NFTDisplayProps {
  userActions: SensitiveDataClientUserAction[]
}

interface NFTImages {
  name: string
  image: string
  width: number
  height: number
  key: string
}

const ButtonWrapper = UserActionFormNFTMintDialog

export function NFTDisplay({ userActions }: NFTDisplayProps) {
  let optInNftButton = true

  const userNfts: NFTImages[] = userActions.reduce(
    (acc: NFTImages[], action: SensitiveDataClientUserAction): NFTImages[] => {
      const nftSlug = action.nftMint?.nftSlug

      if (nftSlug && !NFT_CLIENT_METADATA[nftSlug as NFTSlug]) {
        Sentry.captureMessage(
          `NFTDisplay - nftSlug \`${nftSlug}\` doesn't have an associated \`NFT_CLIENT_METADATA\``,
          {
            extra: { nftSlug, configuredNfts: Object.keys(NFT_CLIENT_METADATA) },
          },
        )
      }

      if (nftSlug && NFT_CLIENT_METADATA[nftSlug as NFTSlug]) {
        const { name, image } = NFT_CLIENT_METADATA[nftSlug as NFTSlug]
        acc.push({
          name,
          image: image.url,
          width: image.width,
          height: image.height,
          key: action.id,
        })
      }

      if (nftSlug === 'swc-shield' && optInNftButton) {
        optInNftButton = false
      }

      return acc
    },
    [],
  )
  const numNfts = userNfts.length

  const emptySpots = numNfts % 3 === 0 ? 0 : 3 - (numNfts % 3)

  return (
    <>
      <div className="flex w-full flex-col flex-wrap items-center gap-4 sm:justify-center md:flex-row lg:h-full xl:justify-between">
        {userNfts.map(nft => {
          const { name, image, key } = nft
          return (
            <NextImage
              alt={name}
              height={335}
              key={key}
              src={image}
              style={{ borderRadius: '24px' }}
              width={335}
            />
          )
        })}
        {emptySpots > 0 &&
          Array.from({ length: emptySpots }, (_, index) => (
            <div
              className="box-content h-[320px] w-[320px] rounded-3xl bg-secondary md:h-[335px] md:w-[335px]"
              key={index}
            ></div>
          ))}
      </div>
      {optInNftButton ?? (
        <div className="m-4 flex justify-center">
          {ButtonWrapper !== undefined ? (
            <ButtonWrapper>
              <Button>Mint Stand With Crypto Supporter NFT</Button>
            </ButtonWrapper>
          ) : null}
        </div>
      )}
    </>
  )
}
