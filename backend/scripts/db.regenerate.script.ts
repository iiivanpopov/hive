import { $ } from 'bun'
import { rm } from 'node:fs/promises'

await rm('./drizzle', { recursive: true, force: true })
await rm('./database.sqlite', { force: true })

await Bun.write('database.sqlite', '')

await $`bun db:generate`
