import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { ApiGroup } from '../enums';

import * as packageJson from '../../../package.json';

export function createSwaggerDocument(app: INestApplication): OpenAPIObject {
  const builder = new DocumentBuilder()
    .setTitle(packageJson.name)
    .setDescription(packageJson.description)
    .setVersion(packageJson.version)
    .addTag(packageJson.name)
    .addBearerAuth(
      {
        description: 'Headers Authorization',
        type: 'http',
        in: 'header',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'Authorization',
    );

  for (const group of Object.values(ApiGroup)) {
    builder.addTag(group);
  }

  const swaggerConfig = builder.build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  return document;
}
