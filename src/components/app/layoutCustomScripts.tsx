import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

type Env = typeof NEXT_PUBLIC_ENVIRONMENT

type Envs = 'all' | Env | Env[]

type LayoutCustomScriptsMap = Record<
  SupportedCountryCodes,
  {
    envs: Envs
    generateElement: () => React.JSX.Element
  }
>

const layoutCustomScriptsMap: Partial<LayoutCustomScriptsMap> = {
  au: {
    envs: 'production',
    generateElement: () => {
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
  },
}

function checkIfEnvIsAllowed(envs: Envs) {
  if (envs === 'all') {
    return true
  }

  const isEnvAllowed = Array.isArray(envs)
    ? envs.includes(NEXT_PUBLIC_ENVIRONMENT)
    : envs === NEXT_PUBLIC_ENVIRONMENT

  return isEnvAllowed
}

export function getLayoutCustomScript(countryCode: SupportedCountryCodes) {
  const layoutCustomScript = layoutCustomScriptsMap[countryCode]

  if (!layoutCustomScript) {
    return null
  }

  const { envs, generateElement } = layoutCustomScript

  if (checkIfEnvIsAllowed(envs)) {
    return generateElement()
  }

  return null
}
