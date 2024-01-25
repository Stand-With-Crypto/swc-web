import { DTSI_TwitterAccount } from '@/data/dtsi/generated'

export function dtsiTwitterAccountUrl({ username }: Pick<DTSI_TwitterAccount, 'username'>) {
  return `https://twitter.com/${username}`
}
