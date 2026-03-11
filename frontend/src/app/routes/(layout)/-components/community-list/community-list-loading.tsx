import { buttonVariants } from '@/components/ui/button'

export function CommunityListLoading() {
  return (
    <div className="relative h-4/5 w-full overflow-hidden">
      <div className="
        no-scrollbar flex h-full flex-col items-center gap-4 overflow-y-auto
      "
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="relative flex w-20 items-center justify-center"
          >
            <div
              className={buttonVariants({
                size: 'icon-lg',
                variant: 'secondary',
                class: 'animate-pulse text-transparent cursor-auto!',
              })}
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
