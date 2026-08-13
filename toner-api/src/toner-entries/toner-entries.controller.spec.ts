import { Test, TestingModule } from '@nestjs/testing';
import { TonerEntriesController } from './toner-entries.controller';
import { TonerEntriesService } from './toner-entries.service';

describe('TonerEntriesController', () => {
  let controller: TonerEntriesController;

  beforeEach(async () => {
    // 生成できることだけを見る。処理は呼ばないので空の差し替えで足りる
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TonerEntriesController],
      providers: [{ provide: TonerEntriesService, useValue: {} }],
    }).compile();

    controller = module.get<TonerEntriesController>(TonerEntriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
