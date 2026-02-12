import {Test, TestingModule} from '@nestjs/testing';
import {ObjectivesService} from './objectives.service';
import {PrismaService} from '../prisma.service';
import {ObjectiveNotFoundException} from '../exceptions/custom-exceptions/objective-not-fount-exception';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime/client';

describe('ObjectivesService', () => {
    let service: ObjectivesService;
    let prisma: any;

    beforeEach(async () => {
        prisma = {
            objective: {
                findMany: jest.fn(),
                findUniqueOrThrow: jest.fn(),
                create: jest.fn(),
                delete: jest.fn(),
                update: jest.fn(),
            },
            keyResult: {
                createMany: jest.fn(),
            },
            $transaction: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ObjectivesService,
                {provide: PrismaService, useValue: prisma},
            ],
        }).compile();

        service = module.get<ObjectivesService>(ObjectivesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    describe('getAll()', () => {
        it('should return all objectives', async () => {
            const objectives = [{id: '1', title: 'Test Objective'}];
            prisma.objective.findMany.mockResolvedValue(objectives);

            const result = await service.getAll();

            expect(prisma.objective.findMany).toHaveBeenCalled();
            expect(result).toEqual(objectives);
        });
    });


    describe('getById()', () => {
        it('should return objective with keyResults', async () => {
            const objective = {
                id: '1',
                title: 'Objective',
                keyResults: [],
            };

            prisma.objective.findUniqueOrThrow.mockResolvedValue(objective);

            const result = await service.getById('1');

            expect(prisma.objective.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {id: '1'},
                include: {keyResults: true},
            });
            expect(result).toEqual(objective);
        });

        it('should throw ObjectiveNotFoundException if objective not found', async () => {
            prisma.objective.findUniqueOrThrow.mockRejectedValue(
                new PrismaClientKnownRequestError(
                    'Not found',
                    {code: 'P2025', clientVersion: '5.0.0'},
                ),
            );

            await expect(service.getById('123')).rejects.toBeInstanceOf(
                ObjectiveNotFoundException,
            );
        });


    });


    describe('create()', () => {
        it('should create objective without keyResults', async () => {
            const dto = {
                title: 'Objective',
                description: 'Desc',
            };

            prisma.$transaction.mockImplementation(async (cb) => {
                return cb(prisma);
            });

            prisma.objective.create.mockResolvedValue({id: '1', ...dto});

            const result = await service.create(dto as any);

            expect(prisma.objective.create).toHaveBeenCalledWith({
                data: {title: dto.title, description: dto.description},
            });
            expect(prisma.keyResult.createMany).not.toHaveBeenCalled();
            expect(result.id).toBe('1');
        });

        it('should create objective with keyResults', async () => {
            const dto = {
                title: 'Objective',
                description: 'Desc',
                keyResults: [{description: 'KR1'}, {description: 'KR2'}],
            };

            prisma.$transaction.mockImplementation(async (cb) => {
                return cb(prisma);
            });

            prisma.objective.create.mockResolvedValue({id: '1'});

            const result = await service.create(dto as any);

            expect(prisma.keyResult.createMany).toHaveBeenCalledWith({
                data: [
                    {description: 'KR1', objectiveId: '1'},
                    {description: 'KR2', objectiveId: '1'},
                ],
            });
            expect(result.id).toBe('1');
        });
    });


    describe('delete()', () => {
        it('should delete objective by id', async () => {
            prisma.objective.delete.mockResolvedValue({id: '1'});

            const result = await service.delete('1');

            expect(prisma.objective.delete).toHaveBeenCalledWith({
                where: {id: '1'},
            });
            expect(result.id).toBe('1');
        });

        it('should throw ObjectiveNotFoundException if objective does not exist', async () => {
            prisma.objective.delete.mockRejectedValue(
                new PrismaClientKnownRequestError(
                    'Not found',
                    {code: 'P2025', clientVersion: '5.0.0'},
                ),
            );

            await expect(service.delete('123')).rejects.toBeInstanceOf(
                ObjectiveNotFoundException,
            );
        });
    });


    describe('update()', () => {
        it('should update objective', async () => {
            const dto = {title: 'Updated Title'};

            prisma.objective.update.mockResolvedValue({
                id: '1',
                title: 'Updated Title',
            });

            const result = await service.update('1', dto);

            expect(prisma.objective.update).toHaveBeenCalledWith({
                where: {id: '1'},
                data: dto,
            });
            expect(result.title).toBe('Updated Title');
        });

        it('should throw ObjectiveNotFoundException if objective does not exist', async () => {
            prisma.objective.update.mockRejectedValue(
                new PrismaClientKnownRequestError(
                    'Not found',
                    {code: 'P2025', clientVersion: '5.0.0'},
                ),
            );

            await expect(
                service.update('123', {title: 'x'}),
            ).rejects.toBeInstanceOf(ObjectiveNotFoundException);
        });
    });
});
