import { DB } from '@server/support/database';

export type BookEntity = DB.BookGetPayload<{
  include: {
    authors: { include: { author: true } };
  };
}>;
