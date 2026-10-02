import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabasesService } from './databases/databases.service';

async function runSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dbService = app.get(DatabasesService);
  await dbService.seedMockJobsIfEmpty();
  await app.close();
  console.log('Seed runner executed successfully!');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});
