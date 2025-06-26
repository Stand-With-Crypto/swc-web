import Script from 'next/script'

// we include this so we can typecheck/pretty format the code that will end up stringified below
// function referenceCodeThatGetsCommmentedOut() {
//   try {
//     localStorage.getItem('doesNotExist')
//   } catch (e) {
//     const localStorageNoop = {
//       length: 0,
//       clear: () => null,
//       getItem: () => null,
//       key: () => null,
//       removeItem: () => null,
//       setItem: () => null,
//     }
//     window.localStorage = localStorageNoop
//     Object.defineProperty(window, 'localStorage', {
//       value: localStorageNoop,
//       configurable: true,
//       enumerable: true,
//       writable: true,
//     })
//   }
// }

export function OverrideGlobalLocalStorage() {
  return (
    <Script id="local-storage-polyfill" strategy="beforeInteractive">
      {`
      try {
        localStorage.getItem('doesNotExist')
      } catch (e) {
        const localStorageNoop = {
          length: 0,
          clear: () => null,
          getItem: () => null,
          key: () => null,
          removeItem: () => null,
          setItem: () => null,
        }
        // Try to assign directly first
        try {
          window.localStorage = localStorageNoop
        } catch (directAssignError) {
          // If direct assignment fails, use defineProperty but with writable: true
          Object.defineProperty(window, 'localStorage', {
            value: localStorageNoop,
            configurable: true,
            enumerable: true,
            writable: true,
          })
        }
      }
      try {
        sessionStorage.getItem('doesNotExist')
      } catch (e) {
        const sessionStorageNoop = {
          length: 0,
          clear: () => null,
          getItem: () => null,
          key: () => null,
          removeItem: () => null,
          setItem: () => null,
        }
        // Try to assign directly first
        try {
          window.sessionStorage = sessionStorageNoop
        } catch (directAssignError) {
          // If direct assignment fails, use defineProperty but with writable: true
          Object.defineProperty(window, 'sessionStorage', {
            value: sessionStorageNoop,
            configurable: true,
            enumerable: true,
            writable: true,
          })
        }
      }
      `}
    </Script>
  )
}
