import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ButcherService } from './butcher.service';
import { ButcherController } from './butcher.controller';
import { Butcher } from './entities/butcher.entity';
import { Livestock } from '../livestock/entities/livestock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Butcher, Livestock])],
  controllers: [ButcherController],
  providers: [ButcherService],
})
export class ButcherModule {}
