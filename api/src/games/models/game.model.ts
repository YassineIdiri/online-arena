import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Result } from './result.enum';

@ObjectType()
export class GameModel {
  @Field(() => Int)
  id: number;

  @Field(() => Result)
  result: Result;

  @Field(() => Int)
  score: number;

  @Field()
  playedAt: Date;
}
