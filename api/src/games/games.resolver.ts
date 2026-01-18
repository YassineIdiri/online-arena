import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { GamesService } from './games.service';
import { GameModel } from './models/game.model';
import { CreateGameInput } from './dto/create-game.input';
import { Stats } from './models/stats.model';

@Resolver()
export class GamesResolver {
  constructor(private games: GamesService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => GameModel)
  createGame(@Args('input') input: CreateGameInput, @Context() ctx: any) {
    const userId = ctx.req.user.userId;
    return this.games.createGame(userId, input.result, input.score);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [GameModel])
  myHistory(@Context() ctx: any) {
    const userId = ctx.req.user.userId;
    return this.games.history(userId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Stats)
  myStats(@Context() ctx: any) {
    const userId = ctx.req.user.userId;
    return this.games.stats(userId);
  }
}
