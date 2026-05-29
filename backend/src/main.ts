import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { createServer, IncomingMessage, ServerResponse, request as httpRequest } from 'http';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

// ── Keep the process alive no matter what ────────────────────────────────────
// On Render free tier, any unhandled rejection/exception causes exit code 1,
// which kills the proxy and breaks the health check. We log and survive instead.
process.on('uncaughtException', (err) => {
  console.error('[process] Uncaught exception (kept alive):', err?.message ?? err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[process] Unhandled rejection (kept alive):', reason);
});

async function bootstrap() {
  const externalPort = Number(process.env.PORT || process.env.APP_PORT || 4000);
  // NestJS binds to an internal port — never conflicts with the proxy
  const nestPort = externalPort + 1;

  // ── Proxy server on the external port (stays alive forever) ──────────────
  // Render's health check hits this immediately and always gets 200.
  // Once NestJS is up, every other request is transparently forwarded.
  let nestReady = false;
  let lastError: string = 'none yet';
  let attemptCount = 0;

  const proxy = createServer((req: IncomingMessage, res: ServerResponse) => {
    // Health check: always 200 so Render never kills the container
    if (req.url === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: nestReady ? 'ok' : 'starting' }));
      return;
    }

    // Debug endpoint: shows last bootstrap error and attempt count
    if (req.url === '/debug') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        nestReady,
        attemptCount,
        lastError,
        env: {
          hasDbUrl: !!process.env.DATABASE_URL,
          dbUrlHost: process.env.DATABASE_URL?.match(/@([^/]+)/)?.[1] ?? 'none',
          appEnv: process.env.APP_ENV,
          nodeEnv: process.env.NODE_ENV,
          port: process.env.PORT,
        },
      }, null, 2));
      return;
    }

    // Not ready yet — return 503 for real API traffic
    if (!nestReady) {
      res.writeHead(503, { 'Content-Type': 'text/plain' });
      res.end('Service initializing — please retry in a moment.');
      return;
    }

    // Forward to NestJS
    const proxyReq = httpRequest(
      {
        hostname: '127.0.0.1',
        port: nestPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode!, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      },
    );

    proxyReq.on('error', (err) => {
      console.error('[proxy] upstream error:', err.message);
      if (!res.headersSent) {
        res.writeHead(502);
        res.end('Bad Gateway');
      }
    });

    req.pipe(proxyReq, { end: true });
  });

  proxy.on('error', (err) => {
    console.error('[proxy] Server error (survived):', err.message);
  });

  await new Promise<void>((resolve) => proxy.listen(externalPort, resolve));
  console.log(`[proxy] Listening on port ${externalPort} — initializing NestJS on ${nestPort}...`);

  // ── NestJS initialization — retry loop so proxy never dies ──────────────
  // TypeORM may take several minutes to connect on Render free tier (internal
  // DNS propagation). We keep retrying so the proxy stays alive regardless.
  let attempt = 0;
  while (true) {
    attempt++;
    attemptCount = attempt;
    try {
      console.log(`[nest] Initialization attempt #${attempt}...`);
      // abortOnError: false → re-throws on init failure instead of process.exit(1)
      // This lets our retry loop catch TypeORM connection errors and try again.
      const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'], abortOnError: false, rawBody: true });

      app.setGlobalPrefix('api/v1');

      // Allow larger payloads (base64-encoded resumes can be ~7MB for 5MB PDFs)
      app.use(bodyParser.json({ limit: '15mb' }));
      app.use(bodyParser.urlencoded({ limit: '15mb', extended: true }));

      const allowedOrigins =
        process.env.APP_ENV === 'production'
          ? [
              'https://josmef-hrms.vercel.app',
              'https://frontend-beta-gold-42.vercel.app',
              /https:\/\/.*\.vercel\.app$/,
            ]
          : ['http://localhost:3000'];
      app.enableCors({ origin: allowedOrigins, credentials: true });

      app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
      );
      app.useGlobalFilters(new GlobalExceptionFilter());

      // Bind NestJS to localhost-only; external traffic reaches it via proxy only
      await app.listen(nestPort, '127.0.0.1');

      nestReady = true;
      console.log(`JOSMEF HRMS API ready — proxy :${externalPort} → NestJS :${nestPort}`);
      break; // success — exit the retry loop
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      const stack = err?.stack ?? '';
      lastError = `[#${attempt} @ ${new Date().toISOString()}] ${msg}\n${stack.split('\n').slice(0, 5).join('\n')}`;
      console.error(`[nest] Attempt #${attempt} failed:`, msg);
      console.log('[nest] Retrying in 15 s — proxy continues serving healthz...');
      await new Promise((r) => setTimeout(r, 15_000));
    }
  }
}
bootstrap();
