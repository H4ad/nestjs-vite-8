import { builtinModules } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { analyzer, unstableRolldownAdapter } from 'vite-bundle-analyzer';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { ViteNestJsPlugin } from './vite-nestjs.plugin.js';

const swaggerUiDistPath = dirname(
  fileURLToPath(import.meta.resolve('swagger-ui-dist/package.json')),
);

const externalDeps = [
  ...builtinModules,
  ...builtinModules
    .filter((m) => !m.startsWith('node:'))
    .map((m) => `node:${m}`),
];

const optionalPeerDeps = [
  '@aws-sdk/client-rds-data',
  '@cloudflare/workers-types',
  '@libsql/client',
  '@libsql/client-wasm',
  '@neondatabase/serverless',
  '@op-engineering/op-sqlite',
  '@opentelemetry/api',
  '@planetscale/database',
  '@prisma/client',
  '@tidbcloud/serverless',
  '@types/better-sqlite3',
  '@types/pg',
  '@types/sql.js',
  '@upstash/redis',
  '@vercel/postgres',
  '@xata.io/client',
  'better-sqlite3',
  'bun-types',
  'expo-sqlite',
  'gel',
  'knex',
  'kysely',
  'mysql2',
  'postgres',
  'sql.js',
  'sqlite3',
];

const missingOptionalPeerDeps = optionalPeerDeps.filter((dependency) => {
  try {
    import.meta.resolve(dependency);
    return false;
  } catch {
    return true;
  }
});

const isExternal = (id: string) =>
  externalDeps.some(
    (dependency) => id === dependency || id.startsWith(`${dependency}/`),
  );

const optionalPeerStubPlugin = {
  name: 'optional-peer-dependency-stubs',
  enforce: 'pre' as const,
  resolveId(id: string) {
    if (
      missingOptionalPeerDeps.some(
        (dependency) => id === dependency || id.startsWith(`${dependency}/`),
      )
    ) {
      return `\0optional-peer-dependency:${id}`;
    }
  },
  load(id: string) {
    const prefix = '\0optional-peer-dependency:';
    if (!id.startsWith(prefix)) return;

    const dependency = id.slice(prefix.length);
    const error = JSON.stringify(
      `Optional dependency "${dependency}" is required by drizzle-orm for this database adapter`,
    );

    return `
      function missingOptionalPeer() { throw new Error(${error}); }
      const neonConfig = {};
      const types = {};
      export {
        missingOptionalPeer as BeginTransactionCommand,
        missingOptionalPeer as Client,
        missingOptionalPeer as CommitTransactionCommand,
        missingOptionalPeer as ExecuteStatementCommand,
        missingOptionalPeer as Pool,
        missingOptionalPeer as RDSDataClient,
        missingOptionalPeer as RollbackTransactionCommand,
        missingOptionalPeer as TypeHint,
        missingOptionalPeer as VercelPool,
        missingOptionalPeer as createClient,
        missingOptionalPeer as createConnection,
        missingOptionalPeer as createPool,
        neonConfig,
        types,
        missingOptionalPeer as sql,
      };
      export default missingOptionalPeer;
    `;
  },
};

const defaultTestExcludes = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/coverage/**',
];

export default defineConfig((env) => {
  return {
    server: {
      port: 3000,
    },
    test: {
      exclude: [
        ...defaultTestExcludes,
        ...(process.env.ESM_BUILD_TEST ? [] : ['test/esm-build.spec.ts']),
      ],
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
      external: externalDeps,
      noExternal: env.mode === 'production' ? true : undefined,
    },
    build: {
      ssr: './src/main.ts',
      sourcemap: true,
      rolldownOptions: {
        output: {
          format: 'es',
          keepNames: true,
          entryFileNames: 'main.js',
          minify: true,
          codeSplitting: false,
        },
        platform: 'node',
        external: isExternal,
      },
    },
    optimizeDeps: {
      noDiscovery: true,
    },
    plugins: [
      ...(env.mode === 'production'
        ? [
            optionalPeerStubPlugin,
            viteStaticCopy({
              environment: 'ssr',
              targets: [
                {
                  src: join(swaggerUiDistPath, '*'),
                  dest: 'swagger-ui-dist',
                },
              ],
            }),
          ]
        : []),
      ...(env.mode !== 'production' ? [ViteNestJsPlugin] : []),
      ...(process.env.BUNDLE_ANALYZER
        ? [
            unstableRolldownAdapter(
              analyzer({
                analyzerMode: 'static',
                openAnalyzer: false,
              }),
            ),
          ]
        : []),
    ],
  };
});
