import { Test, TestingModule } from '@nestjs/testing';
import { KeyResultsController } from './key-results.controller';
import { KeyResultsService } from './key-results.service';

describe('KeyResultsController', () => {
  let controller: KeyResultsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeyResultsController],
      providers: [KeyResultsService],
    }).compile();

    controller = module.get<KeyResultsController>(KeyResultsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
