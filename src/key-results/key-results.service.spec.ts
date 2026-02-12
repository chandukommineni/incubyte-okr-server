import { Test, TestingModule } from '@nestjs/testing';
import { KeyResultsService } from './key-results.service';
import { PrismaService } from '../prisma.service';
import { ObjectiveNotFoundException } from '../exceptions/custom-exceptions/objective-not-fount-exception';

describe('KeyResultsService', () => {
  let service: KeyResultsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      keyResult: {
        create: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      objective: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeyResultsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<KeyResultsService>(KeyResultsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  describe('create()', () => {
    it('should create a key result for an objective', async () => {
      const dto = { description: 'KR 1' };
      const objectiveId = 'obj-1';

      prisma.keyResult.create.mockResolvedValue({
        id: 'kr-1',
        description: 'KR 1',
        objectiveId,
      });

      const result = await service.create(objectiveId, dto as any);

      expect(prisma.keyResult.create).toHaveBeenCalledWith({
        data: {
          description: 'KR 1',
          objectiveId,
        },
      });

      expect(result.objectiveId).toBe(objectiveId);
    });
  });


  describe('delete()', () => {
    it('should delete a key result by id', async () => {
      prisma.keyResult.delete.mockResolvedValue({ id: 'kr-1' });

      const result = await service.delete('kr-1');

      expect(prisma.keyResult.delete).toHaveBeenCalledWith({
        where: { id: 'kr-1' },
      });

      expect(result.id).toBe('kr-1');
    });
  });


  describe('update()', () => {
    it('should update a key result', async () => {
      const dto = { description: 'Updated KR' };

      prisma.keyResult.update.mockResolvedValue({
        id: 'kr-1',
        description: 'Updated KR',
      });

      const result = await service.update('kr-1', dto as any);

      expect(prisma.keyResult.update).toHaveBeenCalledWith({
        where: { id: 'kr-1' },
        data: dto,
      });

      expect(result.description).toBe('Updated KR');
    });
  });

  describe('getAllByObjectiveId()', () => {
    it('should return key results for an objective', async () => {
      const objectiveId = 'obj-1';

      prisma.objective.findUnique.mockResolvedValue({
        id: objectiveId,
      });

      prisma.keyResult.findMany.mockResolvedValue([
        { id: 'kr-1', objectiveId },
        { id: 'kr-2', objectiveId },
      ]);

      const result = await service.getAllByObjectiveId(objectiveId);

      expect(prisma.objective.findUnique).toHaveBeenCalledWith({
        where: { id: objectiveId },
      });

      expect(prisma.keyResult.findMany).toHaveBeenCalledWith({
        where: { objectiveId },
      });

      expect(result).toHaveLength(2);
    });

    it('should throw ObjectiveNotFoundException if objective does not exist', async () => {
      prisma.objective.findUnique.mockResolvedValue(null);

      await expect(
          service.getAllByObjectiveId('invalid-id'),
      ).rejects.toBeInstanceOf(ObjectiveNotFoundException);

      expect(prisma.keyResult.findMany).not.toHaveBeenCalled();
    });
  });
});

