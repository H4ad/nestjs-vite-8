import { IncomingMessage, ServerResponse } from 'node:http';
import { INestApplication } from '@nestjs/common';
import { Connect, Plugin, ViteDevServer } from 'vite';

let prevApp: INestApplication;

export const NestHandler = async ({
  app,
  req,
  res,
}: {
  app: INestApplication;
  req: IncomingMessage;
  res: ServerResponse;
}) => {
  // @ts-expect-error nest app typing error
  if (!app.isInitialized) {
    if (prevApp) await prevApp.close();

    await app.init();
    prevApp = app;
  }

  const instance = app.getHttpAdapter().getInstance();

  if (typeof instance === 'function') {
    instance(req, res);
  } else {
    const fastifyApp = await instance.ready();
    fastifyApp.routing(req, res);
  }
};

export const createMiddleware = async (
  server: ViteDevServer,
): Promise<Connect.HandleFunction> => {
  const requestHandler = NestHandler;

  async function _loadApp() {
    const appModule = await server.ssrLoadModule('./src/main.ts');
    return await appModule['viteNodeApp'];
  }

  if (!requestHandler) {
    console.error('Failed to find a request handler');
    process.exit(1);
  }

  if (server.httpServer)
    server.httpServer.once('listening', async () => {
      await _loadApp();
    });

  const debounceDelayMs = 500;
  const debounce = (fn: () => void, delay: number) => {
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(fn, delay);
    };
  };

  server.watcher.on(
    'change',
    debounce(async () => {
      await _loadApp();
    }, debounceDelayMs),
  );

  return async function (
    req: IncomingMessage,
    res: ServerResponse,
    _next: Connect.NextFunction,
  ): Promise<void> {
    const app = await _loadApp();
    if (app) await requestHandler({ app, req, res });
  };
};

export const ViteNestJsPlugin: Plugin = {
  name: 'vite-plugin-nestjs',
  enforce: 'post',
  configureServer: async (server) => {
    server.middlewares.use(await createMiddleware(server));
  },
};
