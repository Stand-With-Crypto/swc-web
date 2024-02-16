import { SensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { NFTSlug } from '@/utils/shared/nft'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

type NFTDisplayProps = {
  userActions: SensitiveDataClientUserAction[]
}

const retrieveNFTEnumKey = (nftSlug: string) => {
  const nftEnumKey = null
  for (const key in NFTSlug) {
    return NFTSlug[key as keyof typeof NFTSlug] === nftSlug ? key : null
  }
  return nftEnumKey
}

export function NFTDisplay({ userActions }: NFTDisplayProps) {
  //iterate through userActions and find the ones that are NFTs
  //display the NFT images in a grid
  //if there is not an NFT, render a empty grey div

  const _userNFTSlugs: string[][] = userActions.reduce(
    (acc: string[][], action: SensitiveDataClientUserAction): string[][] => {
      const nftSlug = action.nftMint?.nftSlug

      if (nftSlug) {
        const enumKey = retrieveNFTEnumKey(nftSlug)
        if (enumKey) {
          const { name, image } = NFT_CLIENT_METADATA[NFTSlug[enumKey as keyof typeof NFTSlug]]
          acc.push([name, image.url])
        }
      }
      return acc
    },
    [],
  )

  return <div></div>
}
