import { NextResponse, NextRequest } from 'next/server'
import { fullUrl } from '@/utils/shared/urls'
import { FrameRequest, getFrameMessage, getFrameHtmlResponse, FrameMetadataType } from '@coinbase/onchainkit/frame'
import { REGISTRATION_URLS_BY_STATE, StateCode } from '@/components/app/userActionFormVoterRegistration/constants'

const BASE_CHAIN_ID = '8453'
const I_VOTED_NFT_CONTRACT_ADDRESS = process.env.I_VOTED_NFT_CONTRACT_ADDRESS

export const dynamic = 'force-dynamic'

const frameData = [
    {
        buttons: [
            {
                label: `Next →`,
            },
        ],
        image: {
            src: fullUrl('/api/public/frame/image/1'),
        },
        input: {
            text: 'Enter your email address',
        },
        postUrl: fullUrl('/api/public/frame?frame=1'),
    },
    {
        buttons: [
            {
                label: 'Yes',
            },
            {
                label: 'No',
            },
            {
                label: `I'm not sure`,
            },
        ],
        image: {
            src: fullUrl('/api/public/frame/image/2'),
        },
        postUrl: fullUrl('/api/public/frame?frame=2'),
    },
    {
        buttons: [
            {
                label: 'Register to vote',
                action: 'post_redirect',
            },
            {
                label: 'Next →',
                action: 'post',
            },
        ],
        image: {
            src: fullUrl('/api/public/frame/image/3'),
        },
        input: {
            text: 'Enter your state code (CA, NY, etc.)',
        },
        postUrl: fullUrl('/api/public/frame?frame=3'),
    },
    {
        buttons: [
            {
                label: 'Check voter registration',
                action: 'post_redirect',
            },
            {
                label: 'Next →',
                action: 'post',
            },
        ],
        image: {
            src: fullUrl('/api/public/frame/image/4'),
        },
        input: {
            text: 'Enter your state code (CA, NY, etc.)',
        },
        postUrl: fullUrl('/api/public/frame?frame=4'),
    },
    {
        buttons: [
            {
                label: `Mint`,
                action: 'mint',
                target: `eip155:${BASE_CHAIN_ID}:${I_VOTED_NFT_CONTRACT_ADDRESS}`
            },
        ],
        image: {
            src: fullUrl('/api/public/frame/image/5'),
        },
        postUrl: fullUrl('/api/public/frame?frame=5'),
    },
] as FrameMetadataType[];

export async function POST(req: NextRequest): Promise<Response> {
    const url = new URL(req.url);
    const queryParams = url.searchParams;
    const frameIndex = Number(queryParams.get('frame'));

    let accountAddress: string | undefined = '';
    let text: string | undefined = '';

    const body: FrameRequest = await req.json();
    // console.log(`BODY: ${JSON.stringify(body)}`)
    // const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

    // if (isValid) {
    //     accountAddress = message.interactor.verified_accounts[0];
    // }

    // if (message?.input) {
    //     text = message.input;
    // }

    const buttonIndex = body.untrustedData?.buttonIndex;
    const inputText  = body.untrustedData?.inputText as StateCode;
    let link;

    switch (frameIndex) {
        case 0 || 1:
            return new NextResponse(getFrameHtmlResponse(frameData[frameIndex]));
        case 2:
            switch (buttonIndex) {
                case 1:
                    return new NextResponse(getFrameHtmlResponse(frameData[4]));
                case 2:
                    return new NextResponse(getFrameHtmlResponse(frameData[2]));
                case 3:
                    return new NextResponse(getFrameHtmlResponse(frameData[3]));
            }
        case 3:
            console.log(`INPUT TEXT: ${inputText}`)
            link = inputText && REGISTRATION_URLS_BY_STATE[inputText] ?
                REGISTRATION_URLS_BY_STATE[inputText]['registerUrl'] : undefined;
        case 4:
            console.log(`INPUT TEXT: ${inputText}`)
            link = inputText && REGISTRATION_URLS_BY_STATE[inputText] ?
            REGISTRATION_URLS_BY_STATE[inputText]['checkRegistrationUrl'] : undefined;
            console.log(`LINK: ${link}`)
            switch (buttonIndex) {
                case 1:
                    if (link) {
                        return NextResponse.redirect(link as string, { status: 302 });
                    } else {
                        return new NextResponse(getFrameHtmlResponse(frameData[frameIndex - 1]));
                    }
                case 2:
                    return new NextResponse(getFrameHtmlResponse(frameData[4]));
            }
        case 5:
            //
        default:
    }

    return new NextResponse(
        getFrameHtmlResponse(frameData[Number(frameIndex)]),
    );
}