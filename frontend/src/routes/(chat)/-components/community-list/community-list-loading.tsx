export function CommunityListLoading() {
  return (
    <div className="flex flex-col h-full w-20 items-center gap-3">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="size-10 rounded-md animate-pulse bg-zinc-200"
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  )
}
