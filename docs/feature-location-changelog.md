# Location Feature Changelog

## 2025-03-10: 장소 데이터 및 지도 컴포넌트 추가

### 변경 개요
모임에 장소 정보를 추가하고 Kakao Maps API를 통해 지도를 표시하는 기능을 구현했습니다. 사용자들이 모임 장소를 쉽게 확인하고 찾아갈 수 있도록 장소 검색 기능과 지도 표시 기능을 추가했습니다.

---

## 1. DB 스키마 변경

### 테이블: `meetup`

**추가된 컬럼:**
- `location_name` (TEXT, NULL): 장소명 (예: "강남역 BBQ 맛집")
- `location_address` (TEXT, NULL): 도로명 또는 지번 주소
- `location_latitude` (DOUBLE PRECISION, NULL): 위도 (WGS84)
- `location_longitude` (DOUBLE PRECISION, NULL): 경도 (WGS84)

**제약 조건:**
- 위도/경도는 함께 있거나 함께 없어야 함 (`check_location_coordinates`)
- 위도: 33 ~ 43 (한국 영역, `check_latitude_range`)
- 경도: 124 ~ 132 (한국 영역, `check_longitude_range`)

**인덱스:**
- `idx_meetup_location`: 위도/경도 공간 인덱스 (향후 거리 기반 검색용)
- `idx_meetup_location_address`: 주소 전문 검색 인덱스 (GIN)

**Migration 파일:** `supabase/migrations/20250310_add_location_to_meetup.sql`

**호환성:** 기존 모임은 location 필드가 `null`이므로 하위 호환성 유지

---

## 2. 타입 및 스키마 업데이트

### packages/shared/src/types/meetup.ts

**변경 사항:**
- `MeetupRow` 인터페이스에 location 필드 추가:
  - `location_name: string | null`
  - `location_address: string | null`
  - `location_latitude: number | null`
  - `location_longitude: number | null`

**추가된 타입:**
- `MeetupLocation` 인터페이스: 지도 컴포넌트에서 사용하는 장소 정보 객체

**추가된 헬퍼 함수:**
- `hasLocation(meetup)`: 모임에 장소 정보가 있는지 확인
- `extractLocation(meetup)`: 장소 정보 추출 (MeetupLocation | null 반환)

### packages/shared/src/schemas/meetup.ts

**변경 사항:**
- `locationSchema` 추가 (선택적 필드)
- `createMeetupSchema`에 `location` 필드 추가

### packages/shared/src/index.ts

**변경 사항:**
- `MeetupLocation` 타입 export 추가
- `hasLocation`, `extractLocation` 함수 export (이미 * export로 포함됨)

---

## 3. 새로 생성된 파일

### 지도 관련 파일

#### `supabase/migrations/20250310_add_location_to_meetup.sql`
- DB 스키마 확장 migration 파일

#### `apps/web/src/lib/kakao-maps-loader.ts`
- Kakao Maps SDK 동적 로더
- 중복 로드 방지 및 Promise 기반 로딩

#### `apps/web/src/types/kakao-maps.d.ts`
- Kakao Maps API TypeScript 타입 정의
- Map, LatLng, Marker, Places 서비스 등

#### `apps/web/src/components/ui/map/kakao-map.tsx`
- 지도 표시 컴포넌트
- 마커 표시, 로딩 상태, 에러 처리

#### `apps/web/src/components/ui/map/location-picker.tsx`
- 장소 검색 및 선택 컴포넌트
- Kakao Local API 연동
- 검색어 디바운스 (500ms)

#### `apps/web/src/components/ui/map/index.ts`
- Map 컴포넌트 exports

#### `docs/feature-location-changelog.md`
- 이 파일

---

## 4. 수정된 파일

### API 레이어

#### `apps/web/src/lib/api/meetups.ts`

**변경 사항:**
- `normalizeMeetup()`: location 필드 추가 (null 기본값)
- `createMeetup()`: location 데이터 처리 로직 추가
  - `input.location`이 있으면 snake_case로 변환하여 DB에 저장

### UI 컴포넌트

#### `apps/web/src/components/features/meetup/create-meetup-dialog.tsx`

**변경 사항:**
- `LocationPicker` 컴포넌트 import 및 추가
- `location` state 추가 (`LocationPickerValue | null`)
- `resetForm()`에 `setLocation(null)` 추가
- `createMeetupSchema` 유효성 검사 시 `location` 포함
- Dialog 높이 조정: `max-h-[90vh] overflow-y-auto` (장소 검색 UI로 인한 높이 증가)

#### `apps/web/src/routes/meetups/$meetupId.tsx`

**변경 사항:**
- `MapPin` 아이콘 import
- `KakaoMap` 컴포넌트 import
- `extractLocation` 함수 import
- `location` 변수 추가: `extractLocation(meetup)`
- 장소 정보 섹션 추가:
  - 장소 정보 카드 (장소명, 주소)
  - 지도 컴포넌트 (높이: 모바일 240px, 데스크톱 320px)
  - 장소 정보가 있을 때만 표시 (`location &&`)

#### `apps/web/src/components/features/meetup/meetup-card.tsx`

**변경 사항:**
- `MapPin` 아이콘 import
- `hasLocation` 함수 import
- 장소 정보 표시 추가 (Participant progress와 Creator 사이):
  - MapPin 아이콘 + 장소명
  - `hasLocation(meetup)` 체크로 조건부 렌더링

### 환경 설정

#### `apps/web/.env.example`

**변경 사항:**
- `VITE_KAKAO_MAPS_APP_KEY` 환경 변수 추가

---

## 5. 사용법

### 모임 생성 시 장소 추가

1. "새 모임 만들기" 다이얼로그 열기
2. "장소 (선택)" 검색창에 장소명 또는 주소 입력
3. 검색 결과에서 원하는 장소 클릭
4. 선택된 장소 확인 후 모임 생성 완료

### 모임 상세 페이지에서 지도 보기

- **장소가 있는 모임**: Info Cards Grid 다음에 지도와 장소 정보 표시
- **장소가 없는 모임**: 지도 섹션 미표시 (기존과 동일)

### 모임 목록에서 장소 확인

- 모임 카드 하단에 MapPin 아이콘과 함께 장소명 간략 표시
- 장소가 없는 모임은 표시하지 않음

---

## 6. Kakao Maps API 설정

### API 키 발급

1. [Kakao Developers](https://developers.kakao.com) 가입
2. 애플리케이션 생성
3. 플랫폼 설정에서 Web 플랫폼 추가
   - 로컬 개발: `http://localhost:5173` (Vite 기본 포트)
   - Production: 배포 도메인 (예: `https://your-domain.vercel.app`)
4. JavaScript 키 발급받기

### 환경 변수 설정

**로컬 개발:**
```bash
# apps/web/.env
VITE_KAKAO_MAPS_APP_KEY=your-kakao-javascript-key
```

**Vercel 배포:**
1. Vercel Dashboard > Project Settings > Environment Variables
2. `VITE_KAKAO_MAPS_APP_KEY` 추가
3. Production, Preview, Development 모두 체크

---

## 7. 알려진 제한사항

- **API 할당량**: Kakao Maps API 무료 할당량 월 300,000건
- **지역 제약**: 한국 외 지역 장소 검색 제한적
- **로딩 시간**: 지도 SDK 초기 로드 시 1~2초 소요 (첫 로드 시)
- **좌표 범위**: 위도 33~43, 경도 124~132 (한국 영역)

---

## 8. 향후 개선 사항

- [ ] 거리 기반 모임 검색 (내 주변 모임)
- [ ] 지도에서 직접 장소 선택 (클릭 & 드래그)
- [ ] 여러 장소 지원 (다회차 모임)
- [ ] 길찾기 버튼 (Kakao Map 앱 연동)
- [ ] 장소별 모임 통계 (인기 장소)

---

## 9. 롤백 방법

DB 스키마 롤백이 필요한 경우:

```sql
-- 컬럼 제거
ALTER TABLE public.meetup
  DROP COLUMN IF EXISTS location_name,
  DROP COLUMN IF EXISTS location_address,
  DROP COLUMN IF EXISTS location_latitude,
  DROP COLUMN IF EXISTS location_longitude;

-- 인덱스 제거
DROP INDEX IF EXISTS idx_meetup_location;
DROP INDEX IF EXISTS idx_meetup_location_address;
```

코드 롤백: 이 커밋 이전으로 revert

---

## 10. 성능 및 최적화

### Lazy Loading
- 지도 SDK는 필요할 때만 로드 (메인 페이지에서 로드 안 함)
- `loadKakaoMaps()` 함수가 Promise를 캐싱하여 중복 로드 방지

### Debouncing
- 장소 검색은 500ms 디바운스 적용
- 불필요한 API 호출 방지

### Code Splitting
- 지도 관련 코드는 별도 청크로 분리 (Vite 자동 처리)
- 지도를 사용하지 않는 페이지에서는 로드되지 않음

### Memoization
- 지도 컴포넌트는 location이 변경될 때만 리렌더링
- `useEffect` 의존성 배열로 관리

---

## 11. 보안 고려사항

- **API 키 관리**: 클라이언트 사이드 키이므로 도메인 제한 필수
- **입력 검증**: Zod 스키마로 위도/경도 범위 검증
- **SQL Injection 방지**: Supabase ORM 사용으로 자동 방어

---

## 12. 테스트 체크리스트

### 기능 테스트
- [x] 장소 검색 기능 (Kakao Local API)
- [x] 장소 선택 및 제거
- [x] 장소 포함 모임 생성
- [x] 장소 없이 모임 생성 (하위 호환성)
- [x] 모임 상세 페이지 지도 표시
- [x] 기존 모임 (location null) 정상 표시
- [x] 모임 카드에 장소명 표시

### 반응형 테스트
- [x] 모바일: 지도 높이 240px
- [x] 데스크톱: 지도 높이 320px
- [x] Dialog 스크롤 가능 (max-h-[90vh])

### 성능 테스트
- [x] SDK Lazy Loading
- [x] 검색 디바운스 (500ms)
- [x] 중복 SDK 로드 방지

---

## 13. 관련 문서

- **Kakao Maps API**: https://apis.map.kakao.com/web/
- **Kakao Developers**: https://developers.kakao.com
- **Supabase PostGIS** (향후 거리 검색): https://supabase.com/docs/guides/database/extensions/postgis
