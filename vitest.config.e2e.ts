import { mergeConfig } from 'vite';
import baseConfig from './vite.config.js';

export default mergeConfig(baseConfig, {
  test: {
    globals: true,
    include: ['**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
    },
  },
});
