import path from 'node:path'
import { envConfig } from '@/config/env.config'
import { pino } from '@/lib/pino'

const build = await Bun.build({
  entrypoints: ['./src/app/entrypoint.ts'],
  outdir: './dist',
  minify: true,
  sourcemap: envConfig.isDevelopment ? 'linked' : 'none',
  naming: 'index.js',
  define: {
    'Bun.env.NODE_ENV': `'${Bun.env.NODE_ENV}'`,
  },
  target: 'bun',
  format: 'esm',
})

build.outputs.forEach((output) => {
  const fileName = path.basename(output.path)
  const fileSize = (output.size / 1024).toFixed(2)

  pino.info(`Built: ${fileName} ${fileSize} KB`)
})
