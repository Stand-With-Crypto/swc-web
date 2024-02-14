import { SensitiveDataClientUserAction } from "@/clientModels/clientUserAction/sensitiveDataClientUserAction";


type NFTDisplayProps = {
    userActions: SensitiveDataClientUserAction[];
}

export function NFTDisplay( { userActions }: NFTDisplayProps){
    console.log('USER: ', userActions)
    //iterate through userActions and find the ones that are NFTs
    //display the NFT images in a grid 
    //if there is not an NFT, render a empty grey div 
    const userNFTSlugs = userActions.reduce((acc: string[], action: SensitiveDataClientUserAction): string[] =>{
        const nft = action.nftMint?.nftSlug;
        if(nft){
          acc.push(nft)
        }
        return acc
    }, [])

    console.log(userNFTSlugs)
    return (
        <div>
        </div>
    );
}