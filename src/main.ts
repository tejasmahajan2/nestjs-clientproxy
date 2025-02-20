import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  const loggger = new Logger('NestApplication');
  loggger.log(`This application is running on : ${await app.getUrl()}`);
}
bootstrap();
