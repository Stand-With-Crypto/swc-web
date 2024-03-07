import Head from 'next/head'

const videoUrl =
  'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/public/shield/stand-with-crypto-h8EMnIjlCFnMREravQ2irnktkh6egS.mp4'

const siteUrl = 'https://swc-hxs2qx3vs-stand-with-crypto.vercel.app/campaign/shield'

export default function ShieldCampaign() {
  return (
    <div>
      <Head>
        <title>Stand With Crypto</title>

        <meta content="Stand With Cyrpto" property="og:title" />
        <meta content="video" property="og:type" />
        <meta content="https://standwithcrypto.org/campaign/shield" property="og:url" />
        <meta content={videoUrl} property="og:video" />
        <meta content={videoUrl} property="og:video:secure_url" />
        <meta content="video/mp4" property="og:video:type" />
        <meta content="Stand with Crypto" property="og:description" />

        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content="player" name="twitter:card" />
        <meta content="@StandWithCrypto" name="twitter:site" />
        <meta content="Stand With Crypto" name="twitter:title" />
        <meta content="Test Content" name="twitter:description" />
        <meta content="https://yoursite.com/example.png" name="twitter:image" />
        <meta content={siteUrl} name="twitter:player" />
        <meta content="480" name="twitter:player:width" />
        <meta content="480" name="twitter:player:height" />
      </Head>

      <video controls>
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support video
      </video>
    </div>
  )
}
