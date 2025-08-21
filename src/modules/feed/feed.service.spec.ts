import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { FeedService } from './feed.service';
import { Feed } from './entities/feed.entity';
import { Livestock } from '../livestock/entities/livestock.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('FeedService', () => {
  let service: FeedService;
  let feedRepository: Repository<Feed>;
  let livestockRepository: Repository<Livestock>;
  let dataSource: DataSource;

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      manager: {
        save: jest.fn(),
        delete: jest.fn(),
      },
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    }),
  };

  const mockFeedRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    delete: jest.fn(),
  };

  const mockLivestockRepository = {
    findBy: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: getRepositoryToken(Feed),
          useValue: mockFeedRepository,
        },
        {
          provide: getRepositoryToken(Livestock),
          useValue: mockLivestockRepository,
        },
      ],
    }).compile();

    service = module.get<FeedService>(FeedService);
    feedRepository = module.get<Repository<Feed>>(getRepositoryToken(Feed));
    livestockRepository = module.get<Repository<Livestock>>(
      getRepositoryToken(Livestock),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new feed record with livestock', async () => {
      const createFeedDto = {
        name: 'Test Feed',
        description: 'Test Description',
        type: 'Grass',
        amount: 100,
        unitPrice: 10.5,
        livestockIds: ['uuid1', 'uuid2'],
      };

      const mockLivestock = [
        { id: 'uuid1', name: 'Livestock 1' },
        { id: 'uuid2', name: 'Livestock 2' },
      ];

      const mockFeed = {
        id: 'feed-uuid',
        ...createFeedDto,
        livestocks: mockLivestock,
      };

      mockLivestockRepository.findBy.mockResolvedValue(mockLivestock);
      mockFeedRepository.create.mockReturnValue(mockFeed);
      mockFeedRepository.save.mockResolvedValue(mockFeed);

      const result = await service.create(createFeedDto);

      expect(result).toEqual(mockFeed);
      expect(mockLivestockRepository.findBy).toHaveBeenCalledWith({
        id: expect.arrayContaining(createFeedDto.livestockIds),
      });
      expect(mockFeedRepository.create).toHaveBeenCalled();
      expect(mockFeedRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated feed records', async () => {
      const mockFeeds = [
        { id: 'feed1', name: 'Feed 1' },
        { id: 'feed2', name: 'Feed 2' },
      ];
      const mockTotal = 2;

      mockFeedRepository.findAndCount.mockResolvedValue([mockFeeds, mockTotal]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        items: mockFeeds,
        total: mockTotal,
        page: 1,
        limit: 10,
      });
      expect(mockFeedRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a feed record', async () => {
      const mockFeed = { id: 'feed1', name: 'Feed 1' };

      mockFeedRepository.findOne.mockResolvedValue(mockFeed);

      const result = await service.findOne('feed1');

      expect(result).toEqual(mockFeed);
      expect(mockFeedRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'feed1' },
        relations: ['livestocks'],
      });
    });

    it('should throw NotFoundException when feed not found', async () => {
      mockFeedRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a feed record', async () => {
      const updateFeedDto = {
        name: 'Updated Feed',
        livestockIds: ['uuid1'],
      };

      const mockLivestock = [{ id: 'uuid1', name: 'Livestock 1' }];
      const mockFeed = {
        id: 'feed1',
        name: 'Feed 1',
        livestocks: [],
      };
      const mockUpdatedFeed = {
        ...mockFeed,
        ...updateFeedDto,
        livestocks: mockLivestock,
      };

      mockFeedRepository.findOne.mockResolvedValue(mockFeed);
      mockLivestockRepository.findBy.mockResolvedValue(mockLivestock);
      mockFeedRepository.save.mockResolvedValue(mockUpdatedFeed);

      const result = await service.update('feed1', updateFeedDto);

      expect(result).toEqual(mockUpdatedFeed);
      expect(mockFeedRepository.findOne).toHaveBeenCalled();
      expect(mockLivestockRepository.findBy).toHaveBeenCalled();
      expect(mockFeedRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a feed record', async () => {
      const mockFeed = { id: 'feed1', name: 'Feed 1' };

      mockFeedRepository.findOne.mockResolvedValue(mockFeed);
      mockFeedRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('feed1');

      expect(mockFeedRepository.findOne).toHaveBeenCalled();
      expect(mockFeedRepository.delete).toHaveBeenCalledWith('feed1');
    });

    it('should throw NotFoundException when feed not found', async () => {
      mockFeedRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
