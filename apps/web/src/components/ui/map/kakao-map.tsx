import { useEffect, useRef, useState } from 'react'
import { loadKakaoMaps } from '@/lib/kakao-maps-loader'
import { cn } from '@/lib/utils'
import type { MeetupLocation } from '@/lib/types/meetup'

interface KakaoMapProps {
  location: MeetupLocation
  className?: string
  /** 지도 확대 레벨 (1-14, 작을수록 확대) */
  level?: number
  /** 마커 표시 여부 */
  showMarker?: boolean
  /** 지도 인터랙션 활성화 여부 */
  draggable?: boolean
  zoomable?: boolean
}

export function KakaoMap({
  location,
  className,
  level = 3,
  showMarker = true,
  draggable = true,
  zoomable = true,
}: KakaoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null)
  const markerInstanceRef = useRef<kakao.maps.Marker | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    const initMap = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // SDK 로드
        const kakao = await loadKakaoMaps()

        // 지도 생성
        const mapPosition = new kakao.maps.LatLng(location.latitude, location.longitude)
        const mapOptions: kakao.maps.MapOptions = {
          center: mapPosition,
          level,
        }

        const map = new kakao.maps.Map(mapContainerRef.current!, mapOptions)
        mapInstanceRef.current = map

        // 지도 인터랙션 설정
        map.setDraggable(draggable)
        map.setZoomable(zoomable)

        // 마커 생성
        if (showMarker) {
          const marker = new kakao.maps.Marker({
            position: mapPosition,
            map,
          })
          markerInstanceRef.current = marker
        }

        setIsLoading(false)
      } catch (err) {
        console.error('지도 초기화 실패:', err)
        setError(err instanceof Error ? err.message : '지도를 불러올 수 없습니다.')
        setIsLoading(false)
      }
    }

    initMap()

    // 클린업
    return () => {
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setMap(null)
      }
      mapInstanceRef.current = null
    }
  }, [location.latitude, location.longitude, level, showMarker, draggable, zoomable])

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted rounded-lg border border-border',
          className
        )}
      >
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className={cn('relative rounded-lg overflow-hidden border border-border', className)}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            지도 로딩 중...
          </div>
        </div>
      )}
    </div>
  )
}
