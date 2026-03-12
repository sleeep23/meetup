// Kakao Maps API 타입 정의

declare namespace kakao.maps {
  class Map {
    constructor(container: HTMLElement, options: MapOptions)
    setCenter(latlng: LatLng): void
    getCenter(): LatLng
    setLevel(level: number, options?: { animate?: boolean }): void
    getLevel(): number
    setDraggable(draggable: boolean): void
    setZoomable(zoomable: boolean): void
  }

  class LatLng {
    constructor(latitude: number, longitude: number)
    getLat(): number
    getLng(): number
  }

  class Marker {
    constructor(options: MarkerOptions)
    setMap(map: Map | null): void
    getPosition(): LatLng
  }

  interface MapOptions {
    center: LatLng
    level?: number
  }

  interface MarkerOptions {
    position: LatLng
    map?: Map
  }

  namespace services {
    class Places {
      constructor(map?: Map)
      keywordSearch(
        keyword: string,
        callback: (result: PlaceResult[], status: Status) => void,
        options?: PlaceSearchOptions
      ): void
    }

    interface PlaceResult {
      place_name: string
      address_name: string
      road_address_name: string
      x: string // longitude
      y: string // latitude
      id: string
    }

    interface PlaceSearchOptions {
      location?: LatLng
      radius?: number
      page?: number
    }

    enum Status {
      OK = 'OK',
      ZERO_RESULT = 'ZERO_RESULT',
      ERROR = 'ERROR',
    }
  }

  function load(callback: () => void): void
}

interface Window {
  kakao: typeof kakao
}
