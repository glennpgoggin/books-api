export function createMockAuthorEntity(overrides = {}) {
  return {
    id: 'author-1',
    name: 'J.R.R. Tolkien',
    bio: 'Legendary author.',
    ...overrides,
  };
}
