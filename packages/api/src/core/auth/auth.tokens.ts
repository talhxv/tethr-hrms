// Injection token for the tenant-scoped User repository. Symbol tokens keep the
// provider unambiguous and un-collidable across modules.
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
