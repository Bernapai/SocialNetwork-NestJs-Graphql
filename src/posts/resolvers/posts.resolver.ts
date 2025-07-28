import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PostsService } from '../services/posts.service';
import { Post } from '../entities/post.entity';
import { CreatePostInput } from '../dto/create-post.input';
import { UpdatePostInput } from '../dto/update-post.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { ForbiddenException } from '@nestjs/common';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) { }

  // CRUD básico
  @Mutation(() => Post)
  createPost(@Args('createPostInput') createPostInput: CreatePostInput): Promise<Post> {
    return this.postsService.create(createPostInput);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Post], { name: 'posts' })
  findAll(): Promise<Post[]> {
    return this.postsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Post, { name: 'post' })
  findOne(@Args('id', { type: () => String }) id: string): Promise<Post> {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  async updatePost(
    @CurrentUser() currentUser: User, // ✅ User, no Post
    @Args('id', { type: () => String }) id: string,
    @Args('updatePostInput') updatePostInput: UpdatePostInput,
  ): Promise<Post> {
    const post = await this.postsService.findOne(id);

    if (post.authorId.toString() !== currentUser._id.toString()) {
      throw new ForbiddenException('Solo puedes editar tus propios posts');
    }

    return this.postsService.update(id, updatePostInput);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  async removePost(
    @CurrentUser() currentUser: User, // ✅ User, no Post
    @Args('id', { type: () => String }) id: string,
  ): Promise<Post> {
    const post = await this.postsService.findOne(id);

    if (post.authorId.toString() !== currentUser._id.toString()) {
      throw new ForbiddenException('Solo puedes eliminar tus propios posts');
    }

    return this.postsService.remove(id);
  }

}
