import Script from 'next/script'

export function AuLayoutScript() {
  const twitterEventId = process.env.NEXT_PUBLIC_AU_TWITTER_EVENT_ID

  const linkedInPartnerId = process.env.NEXT_PUBLIC_AU_LINKEDIN_PARTNER_ID

  return (
    <>
      {twitterEventId && (
        <Script id="twitterEvent" type="text/javascript">
          {`twq('event', '${twitterEventId}', {});`}
        </Script>
      )}

      {linkedInPartnerId && (
        <>
          <Script id="linkedInPartner" type="text/javascript">
            {`_linkedin_partner_id = "${linkedInPartnerId}"; window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || []; window._linkedin_data_partner_ids.push(_linkedin_partner_id);`}
          </Script>

          <Script id="linkedInTracking" type="text/javascript">
            {`(function(l) { if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])}; window.lintrk.q=[]} var s = document.getElementsByTagName("script")[0]; var b = document.createElement("script"); b.type = "text/javascript";b.async = true; b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js"; s.parentNode.insertBefore(b, s);})(window.lintrk);`}
          </Script>

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
        </>
      )}
    </>
  )
}
