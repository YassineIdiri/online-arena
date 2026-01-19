import { Resolver, Query, ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
class HealthPayload {
  @Field()
  ok!: boolean;

  @Field()
  message!: string;

  @Field()
  timestamp!: string;

  @Field()
  uptimeSec!: number;
}

@Resolver()
export class HealthResolver {
  @Query(() => HealthPayload, { name: "health" })
  health(): HealthPayload {
    return {
      ok: true,
      message: "pong",
      timestamp: new Date().toISOString(),
      uptimeSec: Math.floor(process.uptime()),
    };
  }
}
