'use client'

import Image from 'next/image'
import Script from 'next/script'

import { PageTitle } from '@/components/ui/pageTitleText'

export default function TestCampaignPage() {
  return (
    <div className="standard-spacing-from-navbar container mx-auto">
      <div className="prose max-w-[80ch]">
        <PageTitle className="text-left" size="lg">
          Bring back staking in your state
        </PageTitle>

        <p>
          Only CA, MD, NJ, and WI currently prohibit customers from staking their assets. Tell your
          lawmaker to drop the lawsuit against Coinbase and allow staking.
        </p>

        <Image
          alt="Map of the United States with the states that have banned staking"
          height={463}
          src="/pagesContent/staking/map.svg"
          width={887}
        />

        <p>
          Since June 6, 2023, California, Maryland, New Jersey, and Wisconsin have banned crypto
          holders like you from staking through Coinbase. Millions of users across nearly every
          other state use Coinbase’s staking services to earn rewards—and no user has ever lost
          assets through them. Yet, CA, MD, NJ, and WI continue to fight to prevent their citizens
          from staking.
        </p>

        <p>
          These misguided state-level staking bans have cost Coinbase users in those states
          approximately:
        </p>

        <ul>
          <li>$4M in Maryland</li>
          <li>$2M in Wisconsin</li>
          <li>$12M in New Jersey</li>
          <li>$71M (!!) in California</li>
        </ul>

        <p>
          That’s a total of nearly $90 million in potential rewards lost since 2023—and counting.
          This is what’s at stake, and why we’re calling on these holdout states to align with the
          rest of the country. It's time for a clear federal framework, not a confusing patchwork of
          lawsuits that harm consumers.
          <br />
          Your right to stake with the provider of your choice should not depend on where you live.
          <br />
          Protect your rights—email your elected officials and demand they drop this unnecessary
          lawsuit immediately.
        </p>

        <div
          className="advocacy-actionwidget min-h-[875px] !border-none !shadow-none"
          data-domain="p2a.co"
          data-responsive="true"
          data-shorturl="XxRfaTc"
        />
      </div>

      <Script id="advocacy-actionwidget-script" strategy="lazyOnload">
        {`(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = '//p2a.co/js/embed/widget/advocacywidget.min.js';
  fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'advocacy-actionwidget-code'));`}
      </Script>
    </div>
  )
}
