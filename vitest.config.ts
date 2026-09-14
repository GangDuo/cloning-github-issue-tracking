import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./test/setup.ts'],
    globals: false,
    coverage: {
      provider: 'v8',
      include: ['src/desktop/ts/**', 'src/shared/**']
    }
  }
});
