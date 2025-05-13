import { INestApplication, Logger } from '@nestjs/common';
import { App } from 'supertest/types';
import request from 'supertest';

import { TwoFaModule } from '@features/two-fa';
import { GetEnv, bootstrap, APP_INIT_FAILED } from '@shared';

describe('App - TwoFa (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const customPort = process.env.AUTH_SERVER_PORT;
    const port = GetEnv.getServerPort(customPort);

    const serverApp = await bootstrap<App>(TwoFaModule, port);
    if (!serverApp) {
      Logger.error(APP_INIT_FAILED);
      process.exit(1);
    }

    app = serverApp;
  });

  it('two-fa/get-message', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/two-fa/get-message')
      .expect(200);

    expect(res.status).toBe(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
