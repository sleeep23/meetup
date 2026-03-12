/**
 * Kakao Maps SDK를 동적으로 로드하는 유틸리티
 * 전역 스크립트 중복 로드 방지 및 Promise 기반 로딩 제공
 */

const KAKAO_SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js'
const APP_KEY = import.meta.env.VITE_KAKAO_MAPS_APP_KEY

let loadingPromise: Promise<typeof kakao> | null = null
let isLoaded = false

export async function loadKakaoMaps(): Promise<typeof kakao> {
  // 이미 로드되었으면 즉시 반환
  if (isLoaded && window.kakao?.maps) {
    return window.kakao
  }

  // 로딩 중이면 기존 Promise 반환
  if (loadingPromise) {
    return loadingPromise
  }

  // 새로운 로딩 Promise 생성
  loadingPromise = new Promise((resolve, reject) => {
    // API 키 확인
    if (!APP_KEY) {
      reject(
        new Error(
          'Kakao Maps API 키가 설정되지 않았습니다. VITE_KAKAO_MAPS_APP_KEY 환경 변수를 확인하세요.'
        )
      )
      return
    }

    // 이미 스크립트가 있는지 확인
    const existingScript = document.querySelector(`script[src^="${KAKAO_SDK_URL}"]`)
    if (existingScript) {
      // SDK 로드 완료 대기
      if (window.kakao?.maps) {
        isLoaded = true
        resolve(window.kakao)
      } else {
        existingScript.addEventListener('load', () => {
          isLoaded = true
          resolve(window.kakao)
        })
      }
      return
    }

    // 스크립트 동적 생성
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `${KAKAO_SDK_URL}?appkey=${APP_KEY}&libraries=services&autoload=false`
    script.async = true

    script.onload = () => {
      // autoload=false이므로 수동으로 로드
      window.kakao.maps.load(() => {
        isLoaded = true
        resolve(window.kakao)
      })
    }

    script.onerror = () => {
      loadingPromise = null
      reject(new Error('Kakao Maps SDK 로드에 실패했습니다.'))
    }

    document.head.appendChild(script)
  })

  return loadingPromise
}
