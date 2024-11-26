import { useEffectOnce } from '@/hooks/useEffectOnce'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const isLocal = NEXT_PUBLIC_ENVIRONMENT === 'local'

export function usePromoteDevParticipation() {
  useEffectOnce(() => {
    const asciiShield = `                                                
########################========================
########################========================
########################========================
########################========================
########################========================
########################========================
########################========================
########################========================
########################========================
########################========================
++++++++++++++++++++++++************************
++++++++++++++++++++++++************************
++++++++++++++++++++++++************************
++++++++++++++++++++++++************************
 +++++++++++++++++++++++***********************
  ++++++++++++++++++++++**********************
   +++++++++++++++++++++********************
      ++++++++++++++++++*****************
        ++++++++++++++++***************
          ++++++++++++++*************
                ++++++++*******
                    ++++****
`

    const lines = asciiShield.trim().split('\n')

    const stylesPerChar: Record<string, string> = {
      '#': 'color: #6200ff;',
      '*': 'color: #6200ff;',
      '=': 'color: #C09AFF;',
      '+': 'color: #C09AFF;',
    }

    const styledLines: string[] = []
    const styles: string[] = []

    styledLines.push('%cWELCOME, DEVELOPER!')
    styles.push('color: #6200ff; background: #000000; font-size: 18px; font-weight: bold;')
    styledLines.push(
      `\n\n%cIf you'd like to collaborate or learn more, please check out at: \n\nwww.standwithcrypto.org/contribute\n\n`,
    )
    styles.push('color: #ffffff; background: #000000; font-size: 14px;')

    lines.forEach(line => {
      let styledLine = ''
      const currentStyles: string[] = []

      for (const char of line) {
        styledLine += `%c${char}`
        currentStyles.push(stylesPerChar[char])
      }

      styledLines.push(styledLine)
      styles.push(...currentStyles)
    })

    if (!isLocal) {
      console.log(styledLines.join('\n'), ...styles)
    }
  })

  return null
}
