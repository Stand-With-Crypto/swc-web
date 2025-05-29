import { useEffect, useState } from 'react'
import Script from 'next/script'

export function AuLayoutScript() {
  const twitterEventId = process.env.NEXT_PUBLIC_AU_TWITTER_EVENT_ID
  const linkedInPartnerId = process.env.NEXT_PUBLIC_AU_LINKEDIN_PARTNER_ID
  const [twitterTrackingBlocked, setTwitterTrackingBlocked] = useState(false)

  useEffect(() => {
    // Check if tracking is blocked after a short delay to allow scripts to load
    const checkTracking = setTimeout(() => {
      if (typeof window !== 'undefined' && !window.twq) {
        setTwitterTrackingBlocked(true)
        console.warn('Twitter tracking is blocked or failed to load')
      }
    }, 2000)

    return () => clearTimeout(checkTracking)
  }, [])

  return (
    <>
      {twitterEventId && !twitterTrackingBlocked && (
        <>
          <Script
            id="twitter-base"
            onError={() => setTwitterTrackingBlocked(true)}
            strategy="afterInteractive"
          >
            {`
              try {
                !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
                },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
                a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
                twq('init', '${twitterEventId}');
              } catch (error) {
                console.warn('Failed to initialize Twitter tracking:', error);
              }
            `}
          </Script>
          <Script
            id="twitter-event"
            onError={() => setTwitterTrackingBlocked(true)}
            strategy="afterInteractive"
          >
            {`
              try {
                twq('track', 'PageView');
              } catch (error) {
                console.warn('Failed to track Twitter page view:', error);
              }
            `}
          </Script>
        </>
      )}

      {linkedInPartnerId && (
        <>
          <Script
            id="linkedInPartner"
            onError={e => console.warn('LinkedIn partner script failed to load:', e)}
            type="text/javascript"
          >
            {`
              try {
                _linkedin_partner_id = "${linkedInPartnerId}";
                window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
                window._linkedin_data_partner_ids.push(_linkedin_partner_id);
              } catch (error) {
                console.warn('Failed to initialize LinkedIn tracking:', error);
              }
            `}
          </Script>

          <Script
            id="linkedInTracking"
            onError={e => console.warn('LinkedIn tracking script failed to load:', e)}
            type="text/javascript"
          >
            {`
              try {
                (function(l) {
                  if (!l){
                    window.lintrk = function(a,b){
                      window.lintrk.q.push([a,b])
                    };
                    window.lintrk.q=[]
                  }
                  var s = document.getElementsByTagName("script")[0];
                  var b = document.createElement("script");
                  b.type = "text/javascript";
                  b.async = true;
                  b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                  s.parentNode.insertBefore(b, s);
                })(window.lintrk);
              } catch (error) {
                console.warn('Failed to load LinkedIn tracking script:', error);
              }
            `}
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
