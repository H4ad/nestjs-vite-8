import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ItemsModule } from './items/items.module.js';
import { UsersModule } from './users/users.module.js';

const usePgMem = process.env.NODE_ENV === 'test';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        if (usePgMem) { 
          return {}
        }

        return {
          type: 'postgres' as const,
          url:
            process.env.DATABASE_URL,
          autoLoadEntities: true,
          synchronize: true,
        }
      },
      dataSourceFactory: usePgMem ? async () => await import('./database/pg-mem-testing.js').then(m => m.createPgMemDataSource()) : undefined,
    }),
    UsersModule,
    ItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
