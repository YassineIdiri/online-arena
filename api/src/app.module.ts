import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,

        playground: false, // ✅ on n’utilise plus Playground
        introspection: config.get('NODE_ENV') !== 'production',

        plugins:
          config.get('NODE_ENV') !== 'production'
            ? [ApolloServerPluginLandingPageLocalDefault({ embed: true })]
            : [],

        context: ({ req }) => ({ req }),
      }),
    }),

    PrismaModule,
    AuthModule,
    GamesModule,
    HealthModule,
  ],
})
export class AppModule {}

