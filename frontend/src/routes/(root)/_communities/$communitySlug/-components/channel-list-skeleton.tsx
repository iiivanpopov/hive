export function ChannelListSkeleton() {
  return (
    <div className="relative">
      <div
        className="flex flex-col gap-2 h-[90vh] no-scrollbar overflow-y-auto"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-1.5 bg-zinc-200/50 transition-colors px-2 mx-2 py-1 rounded-sm items-center max-w-44 w-full h-7 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
