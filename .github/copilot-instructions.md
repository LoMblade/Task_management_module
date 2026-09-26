# Workspace instructions

- Use Vietnamese domain names where they match the requirements.
- Keep API layers as route -> service -> repository.
- Put shared Zod schemas and inferred types in `packages/contracts`.
- Scope every business query by `congTyId` from the request context.
- Keep user-facing validation and error messages in Vietnamese.
- Validate with `pnpm typecheck`, `pnpm test`, and `pnpm build`.
