import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared')
    }
  },
  test: {
    environment: 'node',
    include: ['src/server/__tests__/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'lcov']
    }
  }
});
