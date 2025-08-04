import { Module } from '@nestjs/common';
import { LivestockService } from './livestock.service';
import { LivestockController } from './livestock.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Livestock } from './entities/livestock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Livestock])], // Add your Livestock entity here
  controllers: [LivestockController],
  providers: [LivestockService],
})
export class LivestockModule {}
