import { DTSI_TwitterAccount } from '@/data/dtsi/generated'

export const dtsiTwitterAccountUrl = ({ username }: Pick<DTSI_TwitterAccount, 'username'>) =>
  `https://twitter.com/${username}`
