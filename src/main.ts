import { getApp } from './app.config.setup';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';

import { createSwaggerDocument, Scheduler } from './commons';

async function bootstrap() {
  try {
    const app = await getApp();

    if (app) {
      const configService = app.get(ConfigService);
      const cron = configService.get<string>('CRON');
      const hostUrl = configService.get<string>('HOST_URL');
      const schedulers = new Scheduler();

      const enableCron = cron === 'ENABLE';

      // Set up swagger only on non production app.

      const document = createSwaggerDocument(app);
      SwaggerModule.setup('api/docs', app, document);

      console.log({ enableCron });
      if (enableCron && hostUrl) {
        schedulers.start(hostUrl);
      }

      const PORT = configService.get<number>('PORT') ?? 8080;
      Logger.debug(`Attempting to initialize app on port ${PORT}`);
      await app.listen(PORT);

      const listenUrl = await app.getUrl();
      Logger.log(`App successfully initialized, listening on ${listenUrl}.`);

      process.on('SIGINT', () => {
        console.log(
          'Received SIGINT. Terminating Server. \n Press Control-D to exit.',
        );

        if (enableCron) {
          schedulers.stop();
        }
        process.exit();
      });
    }
  } catch (error) {
    Logger.error('App failed to bootstrap: ', error);
    throw error;
  }
}

void bootstrap();
