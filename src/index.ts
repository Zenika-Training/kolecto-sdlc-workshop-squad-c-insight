import { buildApp } from './app.js';
import { DEFAULT_PORT } from './config.js';

const port = Number(process.env.PORT ?? DEFAULT_PORT);
const app = buildApp({ logger: true });

app.listen({ port, host: '0.0.0.0' }).catch((error: unknown) => {
  app.log.error(error);
  process.exit(1);
});
