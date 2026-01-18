import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Stats {
  @Field(() => Int) wins: number;
  @Field(() => Int) losses: number;
  @Field(() => Int) draws: number;
}
