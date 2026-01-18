import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GamesService } from './games.service';
import { GamesResolver } from './games.resolver';

@Module({
  imports: [PrismaModule],
  providers: [GamesService, GamesResolver],
})
export class GamesModule {}
