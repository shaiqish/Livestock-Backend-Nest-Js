import { Module } from '@nestjs/common';
import { SellService } from './sell.service';
import { SellController } from './sell.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sell } from './entities/sell.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sell])],
  controllers: [SellController],
  providers: [SellService],
})
export class SellModule {}
