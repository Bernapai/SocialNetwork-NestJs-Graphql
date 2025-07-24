import { Test, TestingModule } from '@nestjs/testing';
import { LikesResolver } from 'src/likes/resolvers/likes.resolver';
import { LikesService } from 'src/likes/services/likes.service';

describe('LikesResolver', () => {
  let resolver: LikesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LikesResolver, LikesService],
    }).compile();

    resolver = module.get<LikesResolver>(LikesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
