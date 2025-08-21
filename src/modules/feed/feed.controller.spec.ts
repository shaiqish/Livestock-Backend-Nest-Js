import { Test, TestingModule } from '@nestjs/testing';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';

describe('FeedController', () => {
  let controller: FeedController;
  let service: FeedService;

  const mockFeedService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedController],
      providers: [
        {
          provide: FeedService,
          useValue: mockFeedService,
        },
      ],
    }).compile();

    controller = module.get<FeedController>(FeedController);
    service = module.get<FeedService>(FeedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new feed', async () => {
      const createFeedDto = {
        feedType: 'Grass',
        description: 'Fresh grass',
        quantity: 100,
        feedingDate: new Date(),
        cost: 1000,
        livestockIds: ['uuid1', 'uuid2'],
      };

      const mockFeed = {
        id: 'feed-uuid',
        ...createFeedDto,
      };

      mockFeedService.create.mockResolvedValue(mockFeed);

      const result = await controller.create(createFeedDto);

      expect(result).toEqual(mockFeed);
      expect(service.create).toHaveBeenCalledWith(createFeedDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated feed list', async () => {
      const mockFeeds = {
        items: [
          { id: 'feed1', feedType: 'Grass' },
          { id: 'feed2', feedType: 'Hay' },
        ],
        total: 2,
        page: 1,
        limit: 10,
      };

      mockFeedService.findAll.mockResolvedValue(mockFeeds);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(mockFeeds);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });

  describe('findOne', () => {
    it('should return a feed by id', async () => {
      const mockFeed = {
        id: 'feed1',
        feedType: 'Grass',
      };

      mockFeedService.findOne.mockResolvedValue(mockFeed);

      const result = await controller.findOne('feed1');

      expect(result).toEqual(mockFeed);
      expect(service.findOne).toHaveBeenCalledWith('feed1');
    });
  });

  describe('update', () => {
    it('should update a feed', async () => {
      const updateFeedDto = {
        feedType: 'Updated Feed',
        livestockIds: ['uuid1'],
      };

      const mockUpdatedFeed = {
        id: 'feed1',
        ...updateFeedDto,
      };

      mockFeedService.update.mockResolvedValue(mockUpdatedFeed);

      const result = await controller.update('feed1', updateFeedDto);

      expect(result).toEqual(mockUpdatedFeed);
      expect(service.update).toHaveBeenCalledWith('feed1', updateFeedDto);
    });
  });

  describe('remove', () => {
    it('should remove a feed', async () => {
      const mockResult = { affected: 1 };

      mockFeedService.remove.mockResolvedValue(mockResult);

      await controller.remove('feed1');

      expect(service.remove).toHaveBeenCalledWith('feed1');
    });
  });
});
