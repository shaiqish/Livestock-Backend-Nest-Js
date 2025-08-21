import { Test, TestingModule } from '@nestjs/testing';
import { ButcherController } from './butcher.controller';
import { ButcherService } from './butcher.service';

describe('ButcherController', () => {
  let controller: ButcherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ButcherController],
      providers: [ButcherService],
    }).compile();

    controller = module.get<ButcherController>(ButcherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
