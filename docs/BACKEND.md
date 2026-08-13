# Poply backend boundary

Poply currently uses a dedicated Neon Postgres project.

- Neon project name: `Poply`
- Neon project ID: `broad-unit-55453776`
- Primary branch: `main`
- Primary branch ID: `br-weathered-pond-ayzlf2f1`
- Default database: `neondb`

These identifiers exist to prevent cross-project mistakes. They are not credentials.

## Hard boundary

Only the Neon project above may be used for Poply backend work. DokoHilf and all other databases/projects are out of scope.

Never commit database passwords, owner connection strings or privileged credentials. Client-side code must not connect with an owner/admin role.

The game prototype does not require database tables yet. Database schema should be introduced only when an actual online feature needs persistence.
