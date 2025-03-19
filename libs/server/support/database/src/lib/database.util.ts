export async function generateUniqueSlug(
  findUnique: (args: { where: { slug: string } }) => Promise<unknown>,
  baseSlug: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
}
