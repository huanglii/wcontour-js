import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'wContour',
    },
  },
  publicDir: false,
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
})
