import { Field, InputType, Int } from '@nestjs/graphql';
import { Result } from '../models/result.enum';

@InputType()
export class CreateGameInput {
  @Field(() => Result)
  result: Result;

  @Field(() => Int)
  score: number;
}
