export function MeetupCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 w-16 rounded-full bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <div className="h-3 w-12 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted" />
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
        <div className="size-5 rounded-full bg-muted" />
        <div className="h-3 w-16 rounded bg-muted" />
      </div>
    </div>
  )
}
