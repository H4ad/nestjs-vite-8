import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { builtinModules } from 'node:module';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { ViteNestJsPlugin } from './vite-nestjs.plugin.js';

const swaggerUiDistPath = dirname(
  createRequire(import.meta.url).resolve('swagger-ui-dist/package.json'),
);

export default defineConfig((env) => ({
  server: {
    port: 3000,
  },
  oxc: {
    decorator: {
      emitDecoratorMetadata: true,
      legacy: true,
    },
    typescript: {
      rewriteImportExtensions: true,
    },
  },
  define: {
    'process.env': 'process.env',
  },
  ssr: {
    noExternal: env.mode === 'production' ? ['typeorm', 'pg'] : [],
  },
  build: {
    ssr: './src/main.ts',
    sourcemap: true,
    rolldownOptions: {
      output: {
        format: 'cjs',
        keepNames: true,
        entryFileNames: 'main.js',
      },
      platform: 'node',
      external: [
        ...builtinModules,
        ...builtinModules
          .filter((m) => !m.startsWith('node:'))
          .map((m) => `node:${m}`),
      ],
    },
  },
  optimizeDeps: {
    noDiscovery: true,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: join(swaggerUiDistPath, '*'),
          dest: 'swagger-ui-dist',
        },
      ],
    }),
    ...(env.mode !== 'production' ? [ViteNestJsPlugin] : []),
    {
      name: 'cjs-to-esm-oxc-runtime',
      enforce: 'pre',
      transform(code, id) {
        if (
          !id.includes('@oxc-project/runtime') ||
          this.environment?.name !== 'ssr'
        )
          return null;
        if (!code.includes('module.exports')) return null;
        const transformed = code
          .replace(
            /\(module\.exports\s*=\s*([^)]+)\)\s*,\s*\(module\.exports\.__esModule\s*=\s*true\)\s*,\s*\(module\.exports\["default"\]\s*=\s*module\.exports\);/g,
            (_: string, exportValue: string) =>
              `__vite_ssr_exportName__("default", () => ${exportValue.trim()});\n__vite_ssr_exportName__("__esModule", () => true);`,
          )
          .replace(
            /module\.exports\s*=\s*([^,]+),\s*module\.exports\.__esModule\s*=\s*true,\s*module\.exports\["default"\]\s*=\s*module\.exports;/g,
            (_: string, exportValue: string) =>
              `__vite_ssr_exportName__("default", () => (${exportValue.trim()}));\n__vite_ssr_exportName__("__esModule", () => true);`,
          )
          .replace(
            /module\.exports\s*=\s*([^;]+);/g,
            (_: string, exportValue: string) =>
              `__vite_ssr_exportName__("default", () => (${exportValue.trim()}));`,
          );
        if (transformed === code) return null;
        return { code: transformed, map: null };
      },
    },
  ],
}));
