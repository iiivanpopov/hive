import { buttonVariants } from '@/components/ui/button'

export function CommunityListLoading() {
  return (
    <div className="relative w-full h-4/5 overflow-hidden">
      <div className="no-scrollbar overflow-y-auto h-full flex flex-col items-center gap-4">
        {Array.from({ length: 15 }).map((_, index) => (
          <div
            key={index}
            className="relative w-20 flex justify-center items-center"
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
