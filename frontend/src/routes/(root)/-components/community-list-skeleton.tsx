export function CommunityListSkeleton() {
  return Array.from({ length: 10 }).map((_, i) => (
    <div
      key={i}
      className="size-10 rounded-md bg-zinc-200/50 animate-pulse"
      style={{ animationDelay: `${i * 100}ms` }}
    />
  ))
}
