/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'wContour',
      fileName: (format) => `wcontour-js.${format === 'es' ? 'es' : 'umd'}.js`,
    },
  },
  publicDir: false,
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
})
