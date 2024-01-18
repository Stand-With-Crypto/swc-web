import { DTSI_Tweet, DTSI_TwitterAccount } from '@/data/dtsi/generated'

export const dtsiTweetUrl = (
  { id }: Pick<DTSI_Tweet, 'text' | 'id'>,
  { username }: Pick<DTSI_TwitterAccount, 'username'>,
) => `https://twitter.com/${username}/status/${id}`
