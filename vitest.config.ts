import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    // Hindari race: integration test berbagi 1 DB → jalankan serial.
    fileParallelism: false,
  },
});
