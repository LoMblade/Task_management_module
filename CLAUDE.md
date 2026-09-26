# CLAUDE.md

## Project
ERP Long Do - phan he Cong viec cho doanh nghiep xay dung va dien luc.

## Stack
- pnpm workspace
- Fastify 5 + MongoDB
- React 19 + Vite + TanStack Query
- Zod contracts in `packages/contracts`

## Rules
- Keep route -> service -> repository boundaries.
- Derive `userId` and `congTyId` from the simulated JWT context.
- Every Mongo query is scoped by `congTyId`.
- Use Conventional Commits.
- Do not commit real `.env` values.

## Validation
Run `pnpm typecheck`, `pnpm test`, and `pnpm build` before handoff.
