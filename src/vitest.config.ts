import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    coverage: {
      reporter: ['json-summary', 'text', 'lcov'],
      include: ['./src/**']
    }
  }
})
