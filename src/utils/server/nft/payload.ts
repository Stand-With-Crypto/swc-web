export interface airdropPayload {
  nftMintId: string
  contractAddress: string
  recipientWalletAddress: string
}

export interface getAirdropStatusPayload {
  nftMintId: string
  queryId: string
}
