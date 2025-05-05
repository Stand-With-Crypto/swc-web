import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const layoutCustomScriptsMap: Partial<
  Record<SupportedCountryCodes, () => React.JSX.Element>
> = {
  au: () => {
    const twitterEventId = process.env.NEXT_PUBLIC_AU_TWITTER_EVENT_ID || ''
    const twitterEventScriptContent = `twq('event', '${twitterEventId}', {});`

    const linkedInPartnerId = process.env.NEXT_PUBLIC_AU_LINKEDIN_PARTNER_ID || ''
    const linkedInPartnerScriptContent = `_linkedin_partner_id = "${linkedInPartnerId}"; window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || []; window._linkedin_data_partner_ids.push(_linkedin_partner_id);`

    const linkedInTrackingScriptContent = `(function(l) { if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])}; window.lintrk.q=[]} var s = document.getElementsByTagName("script")[0]; var b = document.createElement("script"); b.type = "text/javascript";b.async = true; b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js"; s.parentNode.insertBefore(b, s);})(window.lintrk);`

    const linkedInPixelScript = (
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          height="1"
          src={`https://px.ads.linkedin.com/collect/?pid=${linkedInPartnerId}&fmt=gif`}
          style={{ display: 'none' }}
          width="1"
        />
      </noscript>
    )

    const scripts = {
      linkedInPartnerScriptContent,
      linkedInTrackingScriptContent,
      twitterEventScriptContent,
    }

    return (
      <>
        {Object.entries(scripts).map(([scriptName, scriptContent]) => (
          <script
            dangerouslySetInnerHTML={{ __html: scriptContent }}
            key={scriptName}
            type="text/javascript"
          />
        ))}

        {linkedInPixelScript}
      </>
    )
  },
}
