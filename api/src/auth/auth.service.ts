import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(name: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { name } });
    if (existing) throw new ConflictException('Username already exists');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({ data: { name, passwordHash } });

    const accessToken = await this.jwt.signAsync({ sub: user.id, name: user.name });
    return { accessToken, user };
  }

  async login(name: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { name } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.jwt.signAsync({ sub: user.id, name: user.name });
    return { accessToken, user };
  }
}
