import { useMembersList } from './hooks/use-members-list'

export function MembersList() {
  const { queries } = useMembersList()

  return (
    <aside className="h-full w-64 shrink-0 border-l border-border">
      <div
        className="
          no-scrollbar flex h-full flex-col gap-1.5 overflow-y-auto p-2
        "
      >
        {queries.members.data.members.map(member => (
          <div
            key={member.id}
            className="
              flex cursor-pointer items-center gap-3 rounded-sm px-2 py-1.5
              transition-colors
              hover:bg-muted
            "
          >
            <div
              className="
                flex size-8 shrink-0 items-center justify-center rounded-full
                bg-muted text-sm font-medium text-foreground
              "
            >
              {(member.name ?? member.username).at(0)?.toUpperCase() ?? '?'}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">
                {member.name ?? member.username}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                @
                {member.username}
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
