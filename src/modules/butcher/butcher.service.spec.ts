import { Test, TestingModule } from '@nestjs/testing';
import { ButcherService } from './butcher.service';

describe('ButcherService', () => {
  let service: ButcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ButcherService],
    }).compile();

    service = module.get<ButcherService>(ButcherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
