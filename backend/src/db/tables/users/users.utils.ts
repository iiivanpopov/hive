import type { UserDto } from './users.schema'
import type { User } from './users.table'

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    emailConfirmed: user.emailConfirmed,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}
