import { registerEnumType } from '@nestjs/graphql';

export enum Result {
  win = 'win',
  lose = 'lose',
  draw = 'draw',
}

registerEnumType(Result, { name: 'Result' });
