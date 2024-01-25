import { DTSI_Tweet, DTSI_TwitterAccount } from '@/data/dtsi/generated'

export function dtsiTweetUrl(
  { id }: Pick<DTSI_Tweet, 'text' | 'id'>,
  { username }: Pick<DTSI_TwitterAccount, 'username'>,
) {
  return `https://twitter.com/${username}/status/${id}`
}
