import { Prisma } from '@prisma/client';

export const SoftDeleteExtension = Prisma.defineExtension({
  name: 'softDeleteExtension',
  model: {
    $allModels: {
      async softDelete(this: any, args: Prisma.Args<any, 'delete'>['args']) {
        const ctx = Prisma.getExtensionContext(this);

        return ctx.update({
          where: args.where,
          data: { deletedAt: new Date() },
        });
      },

      async findManyIncludingDeleted(
        this: any,
        args: Prisma.Args<any, 'findMany'>['args']
      ) {
        const ctx = Prisma.getExtensionContext(this);

        const safeArgs = {
          ...args,
          where: {
            ...(args.where ?? {}),
            // This override tells the system: do NOT inject deletedAt filtering
            deletedAt: { not: undefined },
          },
        };

        return ctx.findMany(safeArgs);
      },
    },
  },

  query: {
    $allModels: {
      async findMany({ model, args, query }) {
        if (
          modelHasDeletedAt(model) &&
          !hasManualDeletedAtCondition(args.where)
        ) {
          args.where = { ...(args.where ?? {}), deletedAt: null };
        }
        return query(args);
      },
    },
  },
});

function modelHasDeletedAt(modelName: string): boolean {
  const modelMeta = Prisma.dmmf.datamodel.models.find(
    (m) => m.name === modelName
  );
  return !!modelMeta?.fields.some((f) => f.name === 'deletedAt');
}

function hasManualDeletedAtCondition(where: any): boolean {
  if (!where) return false;
  return (
    'deletedAt' in where ||
    (Array.isArray(where.AND) && where.AND.some(hasManualDeletedAtCondition)) ||
    (Array.isArray(where.OR) && where.OR.some(hasManualDeletedAtCondition)) ||
    (Array.isArray(where.NOT) && where.NOT.some(hasManualDeletedAtCondition))
  );
}
