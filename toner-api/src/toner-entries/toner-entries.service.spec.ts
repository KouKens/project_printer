import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TonerEntriesService } from './toner-entries.service';

describe('TonerEntriesService', () => {
  let service: TonerEntriesService;

  beforeEach(async () => {
    // 生成できることだけを見る。DB には触らないので空の差し替えで足りる
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TonerEntriesService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<TonerEntriesService>(TonerEntriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
