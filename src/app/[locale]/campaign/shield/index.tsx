import Head from 'next/head'

const videoUrl =
  'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/public/shield/stand-with-crypto-h8EMnIjlCFnMREravQ2irnktkh6egS.mp4'

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
      </Head>

      <video controls src={videoUrl} />
    </div>
  )
}
