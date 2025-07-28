import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { LikesService } from '../services/likes.service';
import { Like } from '../entities/like.entity';
import { CreateLikeInput } from '../dto/create-like.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { ForbiddenException } from '@nestjs/common';

@Resolver(() => Like)
export class LikesResolver {
  constructor(private readonly likesService: LikesService) { }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Like)
  createLike(@Args('createLikeInput') createLikeInput: CreateLikeInput): Promise<Like> {
    return this.likesService.create(createLikeInput);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Like], { name: 'likes' })
  findAll(): Promise<Like[]> {
    return this.likesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Like, { name: 'like' })
  findOne(@Args('id', { type: () => String }) id: string): Promise<Like> {
    return this.likesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Like)
  async removeLike(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => String }) id: string,
  ): Promise<Like> {
    const like = await this.likesService.findOne(id);

    if (like.userId.toString() !== currentUser._id.toString()) {
      throw new ForbiddenException('Solo puedes eliminar tus propios likes');
    }

    return this.likesService.remove(id);
  }


}
