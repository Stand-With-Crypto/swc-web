import Script from 'next/script'

// we include this so we can typecheck/pretty format the code that will end up stringified below
// function referenceCodeThatGetsCommmentedOut() {
//   function setWindowStorage(storageType, storageObj) {
//     // Try to assign directly first
//     try {
//       window[storageType] = storageObj
//     } catch (directAssignError) {
//       // If direct assignment fails, use defineProperty but with writable: true
//       Object.defineProperty(window, storageType, {
//         value: storageObj,
//         configurable: true,
//         enumerable: true,
//         writable: true,
//       })
//     }
//   }
//
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
//     setWindowStorage('localStorage', localStorageNoop)
//   }
// }

export function OverrideGlobalLocalStorage() {
  return (
    <Script id="local-storage-polyfill" strategy="beforeInteractive">
      {`
      function setWindowStorage(storageType, storageObj) {
        // Try to assign directly first
        try {
          window[storageType] = storageObj
        } catch (directAssignError) {
          // If direct assignment fails, use defineProperty but with writable: true
          Object.defineProperty(window, storageType, {
            value: storageObj,
            configurable: true,
            enumerable: true,
            writable: true,
          })
        }
      }

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
        setWindowStorage('localStorage', localStorageNoop)
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
        setWindowStorage('sessionStorage', sessionStorageNoop)
      }
      `}
    </Script>
  )
}
