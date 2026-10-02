import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { softDeletePlugin } from './core/soft-delete.plugin';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabasesModule } from './databases/databases.module';
import { FilesModule } from './files/files.module';
import { MailModule } from './mail/mail.module';
import { CompaniesModule } from './companies/companies.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error('MONGODB_URI is not defined in environment variables');
        }
        return {
          uri,
          connectionFactory: (conn) => {
            conn.plugin(softDeletePlugin);
            return conn;
          },
        };
      },
      inject: [ConfigService],
    }),
    PermissionsModule,
    RolesModule,
    UsersModule,
    AuthModule,
    DatabasesModule,
    FilesModule,
    MailModule,
    CompaniesModule,
    JobsModule,
  ],
})
export class AppModule {}
