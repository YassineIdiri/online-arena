import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Result } from './models/result.enum';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  createGame(userId: number, result: Result, score: number) {
    return this.prisma.game.create({
      data: { userId, result, score },
      select: { id: true, result: true, score: true, playedAt: true },
    });
  }

  history(userId: number) {
    return this.prisma.game.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
      select: { id: true, result: true, score: true, playedAt: true },
    });
  }

  async stats(userId: number) {
    const grouped = await this.prisma.game.groupBy({
      by: ['result'],
      where: { userId },
      _count: { _all: true },
    });

    const get = (r: Result) => grouped.find(g => g.result === r)?._count._all ?? 0;

    return {
      wins: get(Result.win),
      losses: get(Result.lose),
      draws: get(Result.draw),
    };
  }
}
