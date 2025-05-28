import { ComponentType } from 'react'

interface FAQEntry {
  title: string
  content: ComponentType
}

export const FAQ_DATA: FAQEntry[] = [
  {
    title: 'If I donate to Stand With Crypto, how will my funds be used?',
    content: () => (
      <>
        <p>
          Stand With Crypto is a grassroots organization dedicated to giving voice to the millions
          of Americans who own crypto and want smart crypto policies that protect consumers and
          promote innovation. Your funds will be used to support that mission, including:
        </p>

        <ul>
          <li>Hosting grassroots events with policymakers and candidates across the country</li>
          <li>Sponsoring Founder Fly-Ins in Washington DC</li>
          <li>
            Building crypto-native advocacy tools that help educate and mobilize the community
          </li>
          <li>Buying advertisements that promote crypto advocacy</li>
          <li>Buying advertising that discusses federal officeholders' positions on crypto</li>
          <li>Producing content that tells the story of crypto, including real-world use cases</li>
          <li>Operating an effective organization, including administrative costs and staffing</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Are my donations tax deductible?',
    content: () => (
      <p>
        No, donations to Stand With Crypto Alliance, a 501(c)(4) organization, are not
        tax-deductible.
      </p>
    ),
  },
  {
    title: 'What is Stand With Crypto and the Stand With Crypto Alliance?',
    content: () => (
      <p>
        Stand With Crypto Alliance is a 501(c)(4) nonprofit organization leading the Stand With
        Crypto movement in the US.
      </p>
    ),
  },
  {
    title: 'What does it mean to Stand With Crypto?',
    content: () => (
      <>
        <p>By Standing With Crypto you choose to:</p>

        <ul>
          <li>Protect the right of Americans to own and use crypto.</li>
          <li>
            Support common-sense legislation and regulation that fosters innovation and creates jobs
            while protecting consumers.
          </li>
          <li>Engage with policymakers to educate and promote sound crypto policy.</li>
          <li>Use your voice locally to build support for the crypto ecosystem.</li>
        </ul>
      </>
    ),
  },
]
