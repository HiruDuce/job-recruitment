import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { softDeletePlugin } from './core/soft-delete.plugin';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/itjobs',
        connectionFactory: (conn) => {
          conn.plugin(softDeletePlugin);
          return conn;
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
