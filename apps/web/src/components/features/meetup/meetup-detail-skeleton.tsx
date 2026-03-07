export function MeetupDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-pulse">
      <div className="h-4 w-16 rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-7 w-20 rounded-full bg-muted" />
        <div className="h-8 w-3/4 rounded bg-muted" />
      </div>
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-muted" />
        <div className="space-y-1.5">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-32 rounded-xl bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
      </div>
      <div className="h-36 rounded-xl bg-muted" />
      <div className="h-12 w-full rounded-lg bg-muted" />
    </div>
  )
}
