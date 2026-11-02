/** Thrown by the stubs until the squad implements them from its spec. */
export class NotImplementedError extends Error {
  constructor(what: string) {
    super(`${what} is not implemented yet: see your spec and tasks`);
    this.name = 'NotImplementedError';
  }
}
