import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, MapPin, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { loadKakaoMaps } from '@/lib/kakao-maps-loader'
import { cn } from '@/lib/utils'

export interface LocationPickerValue {
  name: string
  address: string | null
  latitude: number
  longitude: number
}

interface LocationPickerProps {
  value: LocationPickerValue | null
  onChange: (value: LocationPickerValue | null) => void
  className?: string
}

interface SearchResult {
  id: string
  name: string
  address: string
  roadAddress: string
  latitude: number
  longitude: number
}

export function LocationPicker({ value, onChange, className }: LocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const placesServiceRef = useRef<kakao.maps.services.Places | null>(null)

  // Places 서비스 초기화
  useEffect(() => {
    const initPlacesService = async () => {
      try {
        const kakao = await loadKakaoMaps()
        placesServiceRef.current = new kakao.maps.services.Places()
      } catch (err) {
        console.error('장소 검색 서비스 초기화 실패:', err)
      }
    }
    initPlacesService()
  }, [])

  // 장소 검색 (디바운스 적용)
  const searchPlaces = useCallback((keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    if (!placesServiceRef.current) {
      setError('장소 검색 서비스를 사용할 수 없습니다.')
      return
    }

    setIsLoading(true)
    setError(null)

    placesServiceRef.current.keywordSearch(keyword, (data, status) => {
      setIsLoading(false)

      if (status === kakao.maps.services.Status.OK) {
        const results: SearchResult[] = data.map((place) => ({
          id: place.id,
          name: place.place_name,
          address: place.address_name,
          roadAddress: place.road_address_name || place.address_name,
          latitude: parseFloat(place.y),
          longitude: parseFloat(place.x),
        }))
        setSearchResults(results)
        setShowResults(true)
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        setSearchResults([])
        setShowResults(true)
      } else {
        setError('장소 검색 중 오류가 발생했습니다.')
      }
    })
  }, [])

  // 검색어 변경 핸들러 (디바운스)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value
    setSearchKeyword(keyword)

    // 디바운스: 500ms 대기 후 검색
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }

    searchTimerRef.current = setTimeout(() => {
      searchPlaces(keyword)
    }, 500)
  }

  // 장소 선택
  const handleSelectPlace = (result: SearchResult) => {
    onChange({
      name: result.name,
      address: result.roadAddress,
      latitude: result.latitude,
      longitude: result.longitude,
    })
    setSearchKeyword('')
    setSearchResults([])
    setShowResults(false)
  }

  // 장소 제거
  const handleRemoveLocation = () => {
    onChange(null)
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <Label htmlFor="location-search">장소 (선택)</Label>
        <div className="mt-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="location-search"
            type="text"
            placeholder="장소 이름 또는 주소를 검색하세요"
            value={searchKeyword}
            onChange={handleSearchChange}
            className="pl-9"
            disabled={isLoading}
          />
        </div>

        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>

      {/* 검색 결과 */}
      {showResults && (
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          {searchResults.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto">
              {searchResults.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                    onClick={() => handleSelectPlace(result)}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="size-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.roadAddress}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              검색 결과가 없습니다
            </div>
          )}
        </div>
      )}

      {/* 선택된 장소 */}
      {value && (
        <div className="border border-border rounded-lg bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <MapPin className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{value.name}</p>
                {value.address && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{value.address}</p>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 flex-shrink-0"
              onClick={handleRemoveLocation}
            >
              <X className="size-4" />
              <span className="sr-only">장소 제거</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
