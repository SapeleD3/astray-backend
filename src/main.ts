import { getApp } from './app.config.setup';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';

import { createSwaggerDocument } from './commons';

async function bootstrap() {
  try {
    const app = await getApp();

    if (app) {
      const configService = app.get(ConfigService);
      const isProduction = configService.get<boolean>('isProduction');

      // Set up swagger only on non production app.
      if (!isProduction) {
        const document = createSwaggerDocument(app);
        SwaggerModule.setup('api/docs', app, document);
      }

      const PORT = configService.get<number>('PORT') ?? 8080;
      Logger.debug(`Attempting to initialize app on port ${PORT}`);
      await app.listen(PORT);

      const listenUrl = await app.getUrl();
      Logger.log(`App successfully initialized, listening on ${listenUrl}.`);
    }
  } catch (error) {
    Logger.error('App failed to bootstrap: ', error);
    throw error;
  }
}

void bootstrap();
