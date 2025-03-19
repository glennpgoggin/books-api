import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SoftDeleteExtension } from './soft-delete.extension';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env['DATABASE_URL'],
        },
      },
      // log: ['query', 'info', 'warn', 'error'],
    });
    Object.assign(this, this.$extends(SoftDeleteExtension));
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
