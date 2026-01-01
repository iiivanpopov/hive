import { testClient } from 'hono/testing'

import { createApp } from './create-app'

export const client = testClient(createApp())
