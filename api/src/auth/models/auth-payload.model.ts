import { Field, ObjectType } from '@nestjs/graphql';
import { UserModel } from './user.model';

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field(() => UserModel)
  user: UserModel;
}
