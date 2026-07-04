# Phase 64 - Deployment environment guide

This guide prepares the repository for a stable internet demo. It does not
select a hosting provider or perform a deployment.

## Current deployment behavior

- The API listens on `PORT` when a platform injects it, then `API_PORT`, and
  finally port `3000`.
- Prisma reads `DATABASE_URL` through `apps/api/prisma.config.ts`.
- The web application uses `VITE_API_BASE_URL`, then the legacy
  `VITE_API_URL`, and finally the same-origin path `/api/v1`.
- The Docker web image serves the React build with Nginx and proxies
  `/api/v1` to `http://api:3000/api/v1`.
- Attachments are stored on local disk under `ATTACHMENTS_STORAGE_DIR`.
- The API exposes `/api/v1/health` and `/api/v1/health/database`.

## Architecture options

### Option A - Web and API on a private service network

Nginx serves the frontend and proxies API requests over a private network.
PostgreSQL is managed externally. This keeps browser requests same-origin,
but the API service still needs persistent storage for attachments.

- Difficulty: medium.
- Cost: medium.
- Demo suitability: good.
- Production suitability: good for moderate scale.
- Operations: service networking, database backups, persistent disk and TLS.

### Option B - Static frontend and separate API

The frontend is deployed as a static site, while the API and managed
PostgreSQL run as separate services. Set `VITE_API_BASE_URL` at frontend build
time and configure the frontend origin in `CORS_ORIGINS`.

- Difficulty: medium.
- Cost: low to medium.
- Demo suitability: good.
- Production suitability: strongest separation and scaling model.
- Operations: cross-origin configuration, CSP, managed database and durable
  attachment storage.

The current Nginx Content Security Policy favors same-origin API calls. A
frontend using an API on another origin must add that API origin to
`connect-src` during the deployment-provider integration.

### Option C - Docker Compose on a VPS

Run the existing web, API and PostgreSQL services on a VPS. Put an HTTPS
reverse proxy in front and retain named volumes for PostgreSQL and
attachments.

- Difficulty: medium to high.
- Cost: low and predictable.
- Demo suitability: best match for the current repository.
- Production suitability: acceptable at small scale.
- Operations: operating system patches, TLS renewal, monitoring and backups.

### Recommendation

- Stable demo: Option C. It reuses the current Compose topology, same-origin
  proxy and persistent volumes with the fewest application changes.
- Production: Option B after attachments move to object storage. It separates
  release lifecycles and reduces application-server state.

No provider is selected by this recommendation.

## Environment variables

Never commit real secrets. Demo and production secrets must be generated
independently and stored in the deployment platform's secret manager.

### Backend

| Variable                         | Local                            | Demo                                | Production                                           |
| -------------------------------- | -------------------------------- | ----------------------------------- | ---------------------------------------------------- |
| `NODE_ENV`                       | `development` or Compose value   | `production`                        | `production`                                         |
| `PORT`                           | Usually unset                    | Use platform-injected value         | Use platform-injected value                          |
| `API_PORT`                       | `3000` internally                | Fallback when `PORT` is unavailable | Fallback when `PORT` is unavailable                  |
| `DATABASE_URL`                   | Local PostgreSQL URL             | Managed DB or Compose DB URL        | Managed PostgreSQL URL with required TLS options     |
| `JWT_ACCESS_SECRET`              | Non-production value             | Unique secret                       | Unique rotated secret                                |
| `JWT_REFRESH_SECRET`             | Non-production value             | Different unique secret             | Different unique rotated secret                      |
| `JWT_ACCESS_EXPIRES_IN_SECONDS`  | `900`                            | Explicit value                      | Explicit value                                       |
| `JWT_REFRESH_EXPIRES_IN_SECONDS` | `604800`                         | Explicit value                      | Explicit value                                       |
| `CORS_ORIGINS`                   | Local web origins                | Exact public demo origin            | Comma-separated exact application origins            |
| `ATTACHMENTS_STORAGE_DIR`        | Local directory or Docker volume | Persistent mounted directory        | Persistent storage; object storage recommended later |

`FRONTEND_ORIGIN` remains supported as a local compatibility alias for the
existing Docker Compose configuration. New hosted environments should use
`CORS_ORIGINS`.

`CORS_ORIGINS` is a comma-separated allowlist. Whitespace is removed and `*`
is rejected because CORS credentials are enabled.

### Frontend

| Variable              | Local                          | Demo                            | Production                      |
| --------------------- | ------------------------------ | ------------------------------- | ------------------------------- |
| `VITE_API_BASE_URL`   | `http://localhost:3000/api/v1` | Prefer `/api/v1` behind a proxy | `/api/v1` or the public API URL |
| `VITE_FEEDBACK_EMAIL` | Optional and empty by default  | Optional demo inbox             | Optional support inbox          |

Vite variables are embedded at build time. Changing them requires rebuilding
the frontend. `VITE_API_URL` remains supported for the current Docker build
argument, but new deployments should use `VITE_API_BASE_URL`.

## Environment examples

### Local development

```dotenv
NODE_ENV=development
API_PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5434/biomed?schema=public
JWT_ACCESS_SECRET=LOCAL_ONLY_ACCESS_SECRET
JWT_REFRESH_SECRET=LOCAL_ONLY_REFRESH_SECRET
CORS_ORIGINS=http://localhost:5173
ATTACHMENTS_STORAGE_DIR=storage/attachments
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_FEEDBACK_EMAIL=
```

### Stable demo

```dotenv
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@DATABASE_HOST:5432/biomed?schema=public
JWT_ACCESS_SECRET=GENERATE_IN_SECRET_MANAGER
JWT_REFRESH_SECRET=GENERATE_A_DIFFERENT_SECRET
CORS_ORIGINS=https://demo.example.com
ATTACHMENTS_STORAGE_DIR=/data/attachments
VITE_API_BASE_URL=/api/v1
VITE_FEEDBACK_EMAIL=
```

### Production

```dotenv
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@DATABASE_HOST:5432/biomed?schema=public
JWT_ACCESS_SECRET=GENERATE_AND_ROTATE_SECURELY
JWT_REFRESH_SECRET=GENERATE_AND_ROTATE_SEPARATELY
CORS_ORIGINS=https://app.example.com
ATTACHMENTS_STORAGE_DIR=/data/attachments
VITE_API_BASE_URL=/api/v1
VITE_FEEDBACK_EMAIL=
```

The domains and credentials above are placeholders.

## Build, migration and startup

From the repository root:

```bash
pnpm --filter @biomed/api exec prisma generate
pnpm --filter @biomed/api build
pnpm --filter @biomed/api exec prisma migrate deploy
pnpm --filter @biomed/api start:prod
```

Run migrations as a release or pre-deploy job before starting new API
instances. Do not use `prisma migrate dev` in demo or production.

## Demo seed procedure

The seed is explicit and must never run automatically during production
startup. The operator must first verify that `DATABASE_URL` targets the
dedicated demo database, then run:

```bash
pnpm --filter @biomed/api run prisma:seed
```

Production deployments must omit this step. A future deployment pipeline may
add an explicit `DEMO_SEED_ENABLED` guard before invoking the existing seed
command.

## Attachment persistence

Database records contain attachment metadata, while file bytes remain on the
API filesystem. An ephemeral container can restart with intact database rows
but missing files.

For the stable demo:

1. Mount a persistent volume at `ATTACHMENTS_STORAGE_DIR`.
2. Include that volume in backups.
3. Keep the same mount available to every API instance that may serve a
   download.

Object storage such as S3-compatible storage is recommended for a future
phase, but is not integrated here.

## Health checks

Use the lightweight endpoint for liveness:

```text
GET /api/v1/health
```

Use the database endpoint for readiness:

```text
GET /api/v1/health/database
```

The public reverse proxy should route both paths to the API. A failing
database readiness check should prevent new traffic from reaching an
unhealthy instance.

## Pre-deployment checklist

1. Provision PostgreSQL and verify network/TLS requirements.
2. Create unique JWT secrets in a secret manager.
3. Configure exact `CORS_ORIGINS`; never use `*`.
4. Apply migrations before application startup.
5. Run the seed only against the demo database.
6. Mount and back up persistent attachment storage.
7. Terminate HTTPS at the platform or reverse proxy.
8. Configure liveness and readiness health checks.
9. Verify `/`, `/demo`, `/feedback`, `/login` and authenticated routes.
10. Confirm that logs do not contain tokens, passwords or database URLs.

## Remaining deployment risks

- Local filesystem attachments prevent stateless horizontal scaling.
- The repository does not configure public TLS or automated backups.
- A cross-origin frontend requires a matching CORS allowlist and CSP update.
- Database connection limits and managed-provider TLS settings must be tuned
  for the selected provider.
- Demo credentials must never be reused as production credentials.
