export interface Profile {
  id: string
  nickname: string | null
  avatar_url: string | null
  created_at: string
}

export interface MeetupRow {
  id: string
  title: string
  description: string | null
  max_participants: number
  deadline: string
  created_by: string
  created_at: string
}

export interface ApplicationRow {
  id: string
  meetup_id: string
  user_id: string
  created_at: string
}

// ── Mock 유저 프로필 ────────────────────────────

const initialProfiles: Profile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    nickname: '김철수',
    avatar_url: null,
    created_at: '2026-01-15T09:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    nickname: '이영희',
    avatar_url: null,
    created_at: '2026-01-20T14:30:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    nickname: '박민수',
    avatar_url: null,
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    nickname: '정수진',
    avatar_url: null,
    created_at: '2026-02-10T16:00:00Z',
  },
]

// ── Mock 모임 ───────────────────────────────────

const initialMeetups: MeetupRow[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    title: '주말 북한산 등산 모임',
    description: '토요일 아침 북한산 백운대 코스로 등산합니다. 초보자 환영!',
    max_participants: 10,
    deadline: '2026-04-05T00:00:00Z',
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: '2026-03-01T08:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    title: 'React 스터디 모집',
    description: '매주 수요일 저녁 React 19 및 TanStack 생태계를 함께 공부합니다.',
    max_participants: 8,
    deadline: '2026-03-20T00:00:00Z',
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-03-02T10:30:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    title: '강남 독서 모임',
    description: '월 1회 비즈니스/자기계발 서적을 읽고 토론합니다.',
    max_participants: 15,
    deadline: '2026-03-25T00:00:00Z',
    created_by: '00000000-0000-0000-0000-000000000003',
    created_at: '2026-03-03T14:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    title: '주말 러닝 크루',
    description: '한강 러닝 크루입니다. 매주 일요일 오전 7시 여의도 출발.',
    max_participants: 20,
    deadline: '2026-04-10T00:00:00Z',
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: '2026-03-04T09:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    title: '보드게임 번개',
    description: '홍대 보드게임 카페에서 다양한 보드게임을 즐깁니다.',
    max_participants: 6,
    deadline: '2026-03-15T00:00:00Z',
    created_by: '00000000-0000-0000-0000-000000000004',
    created_at: '2026-03-05T18:00:00Z',
  },
]

// ── Mock 신청 ───────────────────────────────────

const initialApplications: ApplicationRow[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    meetup_id: '10000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-03-01T12:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    meetup_id: '10000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000003',
    created_at: '2026-03-01T15:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    meetup_id: '10000000-0000-0000-0000-000000000002',
    user_id: '00000000-0000-0000-0000-000000000001',
    created_at: '2026-03-02T11:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    meetup_id: '10000000-0000-0000-0000-000000000002',
    user_id: '00000000-0000-0000-0000-000000000003',
    created_at: '2026-03-02T14:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    meetup_id: '10000000-0000-0000-0000-000000000003',
    user_id: '00000000-0000-0000-0000-000000000001',
    created_at: '2026-03-03T16:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000006',
    meetup_id: '10000000-0000-0000-0000-000000000005',
    user_id: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-03-05T20:00:00Z',
  },
]

// ── In-memory 스토어 ────────────────────────────

let profiles = structuredClone(initialProfiles)
let meetups = structuredClone(initialMeetups)
let applications = structuredClone(initialApplications)

let meetupCounter = 6
let applicationCounter = 7

export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001'

// ── Profile 헬퍼 ────────────────────────────────

export function getProfiles() {
  return profiles
}

export function getProfile(id: string) {
  return profiles.find((p) => p.id === id) ?? null
}

export function updateProfile(id: string, updates: { nickname?: string; avatar_url?: string }) {
  const profile = profiles.find((p) => p.id === id)
  if (!profile) return null
  if (updates.nickname !== undefined) profile.nickname = updates.nickname
  if (updates.avatar_url !== undefined) profile.avatar_url = updates.avatar_url
  return profile
}

// ── Meetup 헬퍼 ─────────────────────────────────

export function getMeetups() {
  return meetups
    .map((m) => enrichMeetup(m))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getMeetup(id: string) {
  const meetup = meetups.find((m) => m.id === id)
  if (!meetup) return null
  return enrichMeetup(meetup)
}

export function createMeetup(input: {
  title: string
  description?: string | null
  max_participants: number
  deadline: string
  created_by: string
}): MeetupRow {
  const newMeetup: MeetupRow = {
    id: `10000000-0000-0000-0000-${String(meetupCounter++).padStart(12, '0')}`,
    title: input.title,
    description: input.description ?? null,
    max_participants: input.max_participants,
    deadline: input.deadline,
    created_by: input.created_by,
    created_at: new Date().toISOString(),
  }
  meetups.push(newMeetup)
  return newMeetup
}

export function updateMeetup(
  id: string,
  userId: string,
  updates: Partial<Pick<MeetupRow, 'title' | 'description' | 'max_participants' | 'deadline'>>,
) {
  const meetup = meetups.find((m) => m.id === id && m.created_by === userId)
  if (!meetup) return null
  if (updates.title !== undefined) meetup.title = updates.title
  if (updates.description !== undefined) meetup.description = updates.description
  if (updates.max_participants !== undefined) meetup.max_participants = updates.max_participants
  if (updates.deadline !== undefined) meetup.deadline = updates.deadline
  return meetup
}

export function deleteMeetup(id: string, userId: string) {
  const index = meetups.findIndex((m) => m.id === id && m.created_by === userId)
  if (index === -1) return false
  meetups.splice(index, 1)
  applications = applications.filter((a) => a.meetup_id !== id)
  return true
}

// ── Application 헬퍼 ────────────────────────────

export function getApplicationsForMeetup(meetupId: string) {
  return applications.filter((a) => a.meetup_id === meetupId)
}

export function getUserApplication(meetupId: string, userId: string) {
  return applications.find((a) => a.meetup_id === meetupId && a.user_id === userId) ?? null
}

export function getUserApplicationMeetupIds(userId: string) {
  return applications.filter((a) => a.user_id === userId).map((a) => a.meetup_id)
}

export function applyToMeetup(
  meetupId: string,
  userId: string,
): { data: ApplicationRow | null; error: string | null } {
  if (!meetups.find((m) => m.id === meetupId)) {
    return { data: null, error: '존재하지 않는 모임입니다' }
  }

  const existing = applications.find((a) => a.meetup_id === meetupId && a.user_id === userId)
  if (existing) {
    return { data: null, error: '이미 신청한 모임입니다' }
  }

  const newApp: ApplicationRow = {
    id: `20000000-0000-0000-0000-${String(applicationCounter++).padStart(12, '0')}`,
    meetup_id: meetupId,
    user_id: userId,
    created_at: new Date().toISOString(),
  }
  applications.push(newApp)
  return { data: newApp, error: null }
}

export function cancelApplication(meetupId: string, userId: string) {
  const index = applications.findIndex((a) => a.meetup_id === meetupId && a.user_id === userId)
  if (index === -1) return false
  applications.splice(index, 1)
  return true
}

// ── 유틸리티 ────────────────────────────────────

function enrichMeetup(meetup: MeetupRow) {
  const applicationCount = applications.filter((a) => a.meetup_id === meetup.id).length
  const profile = profiles.find((p) => p.id === meetup.created_by)
  return {
    ...meetup,
    application_count: applicationCount,
    creator_profile: profile
      ? { nickname: profile.nickname, avatar_url: profile.avatar_url }
      : null,
  }
}

export function resetData() {
  profiles = structuredClone(initialProfiles)
  meetups = structuredClone(initialMeetups)
  applications = structuredClone(initialApplications)
  meetupCounter = 6
  applicationCounter = 7
}
