// This is the ETH threshold in which we will stop the cron job if the current transaction fee exceeds the threshold.
export const AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD =
  Number(process.env.AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD) || 0.00001
