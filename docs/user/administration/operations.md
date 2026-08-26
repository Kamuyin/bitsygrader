# Operations

## Database

BYTEGrader accepts any SQLAlchemy database URI. SQLite is useful for local development; PostgreSQL is the intended shape of the Docker scaffold.

Tables are currently created automatically at service startup. Alembic migrations are not implemented, so back up the database before upgrading and inspect schema changes between releases manually.

## Asset storage

Assignment assets are stored below `DatabaseConfig.asset_path`. The database records the original relative path, size, assignment ID, and generated storage ID.

- Place the directory on persistent storage.
- Restrict write access to the service account.
- Back it up together with the database so records and files stay consistent.
- Monitor orphaned files; assignment deletion currently removes database rows but does not explicitly remove stored asset files.

## Logging and request IDs

The service returns `X-Request-ID` and includes the same identifier in JSON error responses. Preserve it in reverse-proxy logs.

Optional Sentry and OpenTelemetry integrations are available through Python extras. They capture service startup, HTTP context, authenticated user context, scheduler failures, grading failures, SQLAlchemy activity, and LTI errors when configured.

## Shutdown and recovery

The scheduler and grading queue are process-local. Plan maintenance windows around active submissions and grading jobs. A hard restart can leave a submission in `submitted` state without a queued job.

Recommended backups include:

1. a transactionally consistent database snapshot;
2. the assignment asset directory from the same point in time;
3. configuration excluding secrets, plus a separate secret-system backup procedure.

## Docker status

The repository contains a development-oriented Compose topology for Moodle, PostgreSQL, JupyterHub, and BYTEGrader. It is currently marked as work in progress and contains defaults that are unsuitable for production. Treat it as an integration reference, not a supported deployment recipe.

Before production use, provide external secret management, TLS termination, durable storage, tested health checks, a safe notebook executor, database migrations, resource limits, backup restoration tests, and monitoring.
