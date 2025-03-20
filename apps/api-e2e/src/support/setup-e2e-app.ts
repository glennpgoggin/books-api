import {
  INestApplication,
  ValidationPipe,
  ModuleMetadata,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

export const createTestApp = async (
  modules: ModuleMetadata['imports']
): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: modules,
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );

  await app.init();
  return app;
};
