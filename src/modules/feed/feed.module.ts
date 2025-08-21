import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { Feed } from './entities/feed.entity';
import { Livestock } from '../livestock/entities/livestock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Feed, Livestock])],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
