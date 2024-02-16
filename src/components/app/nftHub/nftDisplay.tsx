import Image from 'next/image'

import { SensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
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

export function NFTDisplay({ userActions }: NFTDisplayProps) {
  console.log('USER: ', userActions)
  //iterate through userActions and find the ones that are NFTs
  //display the NFT images in a grid
  //if there is not an NFT, render a empty grey div

  const userNFTs: NFTImages[] = userActions.reduce(
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
  //map through the array and display the NFTs
  console.log(userNFTs)
  return (
    <div>
      {userNFTs.map((nft: NFTImages) => (
        <div key={nft.name}>
          <Image
            alt={nft.name}
            className="h-full w-full rounded-2xl object-cover"
            src={nft.image}
          />
        </div>
      ))}
    </div>
  )
}

/* Rectangle 7642712 */

// width: 354.33px;
// height: 357px;

// background: url(Screenshot 2023-11-06 at 3.54.43 PM.png);
// border-radius: 24px;

// /* Inside auto layout */
// flex: none;
// order: 0;
// align-self: stretch;
// flex-grow: 1;

//div to house NFT collection
//display NFT in a grid
//when there are no NFTs, show grey box that is the same size as the NFTs
//in mobile, probably want to go from row to column
//want a button on the bottom that links to minting crypto supporter NFT
