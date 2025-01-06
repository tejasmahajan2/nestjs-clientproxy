import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MATH_SERVICE } from './constants/variables.contants';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: MATH_SERVICE,
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('MATH_SERVICE_HOST'),
            port: configService.get<number>('MATH_SERVICE_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
