import { NextRequest } from 'next/server'

import { generateFrameImage } from '@/utils/server/generateFrameImage'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.HOUR
export const runtime = 'edge'

export async function GET(_request: NextRequest, { params }: { params: { index: number } }) {
    const nftImage = await fetch(new URL('./nft.png', import.meta.url)).then(res =>
        res.arrayBuffer(),
    )

    const shieldImage = await fetch(new URL('./shield.png', import.meta.url)).then(res =>
        res.arrayBuffer(),
    )

    const images = [
        <div tw="flex flex-col w-full h-full items-center justify-center bg-white">
            <div tw="flex w-full h-full text-white" style={{ background: 'linear-gradient(180deg, #130032 0%, #000 100%)' }}>
                <div tw="flex flex-row w-full p-15 items-center justify-center">
                    <img style={{ borderRadius: "50%" }} height="300" src={nftImage as any} width="300" />
                    <h2 tw="flex flex-col text-8xl font-bold tracking-tight text-left px-10">
                        <span>Register to vote</span>
                        <span tw="text-[#9e62ff] text-7xl">Get a free NFT</span>
                    </h2>
                </div>
            </div>
        </div>,
        <div tw="flex flex-col w-full h-full items-center justify-center bg-white">
            <div tw="flex w-full h-full text-white" style={{ background: 'linear-gradient(180deg, #130032 0%, #000 100%)' }}>
                <div tw="flex flex-row w-full p-15 items-center justify-center">
                    <img height="200" src={shieldImage as any} width="200" />
                    <h2 tw="flex flex-col text-6xl font-bold tracking-tight text-left px-10">
                        <span>Join Stand With Crypto</span>
                        <div tw="flex flex-row text-3xl text-[#9e62ff] mt-4">
                            <span>Join over 300,000 advocates fighting to keep crypto in America.</span>
                        </div>
                    </h2>
                </div>
            </div>
        </div>,
        <div tw="flex flex-col w-full h-full items-center justify-center bg-white">
            <div tw="flex w-full h-full text-white" style={{ background: 'linear-gradient(180deg, #130032 0%, #000 100%)' }}>
                <div tw="flex flex-row w-full p-15 items-center justify-center">
                    <img height="200" src={shieldImage as any} width="200" />
                    <h2 tw="flex flex-col text-6xl font-bold tracking-tight text-left px-10">
                        <span>Are you registered to vote?</span>
                        {/* <span tw="text-gray-400 text-4xl">Register to vote or check your voter registration and get a free "I Registered" NFT</span> */}
                        <div tw="flex flex-row text-3xl text-gray-400 mt-4">
                            <span>Personal information subject to Privacy Policy:</span>
                        </div>
                        <div tw="flex flex-row text-2xl text-gray-400 mt-2">
                            <span tw="text-[#9e62ff] pl-1">https://www.standwithcrypto.org/privacy</span>
                        </div>
                    </h2>
                </div>
            </div>
        </div>,
        <div tw="flex flex-col w-full h-full items-center justify-center bg-white">
            <div tw="flex w-full h-full text-white" style={{ background: 'linear-gradient(180deg, #130032 0%, #000 100%)' }}>
                <div tw="flex flex-row w-full p-15 items-center justify-center">
                    <img height="200" src={shieldImage as any} width="200" />
                    <h2 tw="flex flex-col text-6xl font-bold tracking-tight text-left px-10">
                        <span>Register to vote</span>
                    </h2>
                </div>
            </div>
        </div>,
        <div tw="flex flex-col w-full h-full items-center justify-center bg-white">
            <div tw="flex w-full h-full text-white" style={{ background: 'linear-gradient(180deg, #130032 0%, #000 100%)' }}>
                <div tw="flex flex-row w-full p-15 items-center justify-center">
                    <img height="200" src={shieldImage as any} width="200" />
                    <h2 tw="flex flex-col text-6xl font-bold tracking-tight text-left px-10">
                        <span>Check your voter registration</span>
                    </h2>
                </div>
            </div>
        </div>,
        <div tw="flex flex-col w-full h-full items-center justify-center bg-white">
            <div tw="flex w-full h-full text-white" style={{ background: 'linear-gradient(180deg, #130032 0%, #000 100%)' }}>
                <div tw="flex flex-row w-full p-15 items-center justify-center">
                    <img style={{ borderRadius: "50%" }} height="300" src={nftImage as any} width="300" />
                    <h2 tw="flex flex-col text-8xl font-bold tracking-tight text-left px-10">
                        <span>Claim a free NFT</span>
                        <span tw="text-[#9e62ff] text-6xl">"I'm a Voter" by pplpleasr</span>
                    </h2>
                </div>
            </div>
        </div>,
    ]

    return generateFrameImage(
        images[params.index]
    )
}