import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LivestockModule } from './modules/livestock/livestock.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './config/dbConfig';
import { ConfigModule } from '@nestjs/config';
import { SellModule } from './modules/sell/sell.module';
import { BreedModule } from './modules/breed/breed.module';
import { GroupModule } from './modules/group/group.module';
import { ContactModule } from './modules/contact/contact.module';
import { ButcherModule } from './modules/butcher/butcher.module';
import { MedicationModule } from './modules/treatments/medication/medication.module';
import { FeedModule } from './modules/feed/feed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dbConfig),
    LivestockModule,
    SellModule,
    BreedModule,
    GroupModule,
    ContactModule,
    ButcherModule,
    FeedModule,
    MedicationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
