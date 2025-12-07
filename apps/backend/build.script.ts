import { envConfig } from '@/config/env.config'
import { pino } from '@/lib/pino'

const build = await Bun.build({
  entrypoints: ['./src/app/entrypoint.ts'],
  outdir: './dist',
  minify: true,
  sourcemap: envConfig.isDevelopment ? 'linked' : 'none',
  naming: 'index.js',
  define: {
    'import.meta.env.NODE_ENV': `"${envConfig.nodeEnv}"`,
  },
  target: 'bun',
  format: 'esm',
})

build.outputs.forEach((output) => {
  const fileName = output.path.split('\\').pop()
  const fileSize = (output.size / 1024).toFixed(2)

  pino.info(`Built: ${fileName} ${fileSize} KB`)
})
