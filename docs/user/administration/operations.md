# Operations

## Upgrading to the renamed package

BitsyGrader uses `bitsygrader` for the Python package, import namespace, JupyterHub service name, and primary command. `bgrader` is a CLI alias. The JupyterLab extension is `@bytechallenge/bitsygrader`; the optional executor package and module are `bitsygrader-executor-systemd` and `bitsygrader_systemd`.

For an existing deployment:

1. Stop the service after queued grading work finishes, and back up its database and assets together.
2. Uninstall the previous Python and JupyterLab packages from the service and user-server environments, and remove their old Jupyter Server enablement entries. Install BitsyGrader and enable its server extension with `jupyter server extension enable bitsygrader --sys-prefix`.
3. Update Python imports, `c.BitsyGraderConfig` sections, executor class paths, and project-specific environment variables to `BITSYGRADER_*`. Update JupyterHub service names and role scopes, URLs under `/services/bitsygrader/`, service commands, and config filenames to `bitsygrader_config.py`.
4. Set `DatabaseConfig.uri` and `DatabaseConfig.asset_path` to the existing data locations, or migrate the files before starting the renamed service. The default database filename, systemd directories, and Compose resource names have changed. Preserve or explicitly migrate existing Compose volumes; starting with new volume names creates empty storage.
5. Restart the service and user servers, reload JupyterLab, and check the **BYTE Grader** menu, course list, assignment fetch, and submission flow.

The rename does not change database tables, notebook cell IDs, or the nbgrader notebook metadata format. Existing data can be reused with the correct paths; configuration and service names are not automatically migrated.

## Database

BitsyGrader accepts any SQLAlchemy database URI. SQLite is useful for local development; PostgreSQL is the intended shape of the Docker scaffold.

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

The repository contains a development-oriented Compose topology for Moodle, PostgreSQL, JupyterHub, and BitsyGrader. It is currently marked as work in progress and contains defaults that are unsuitable for production. Treat it as an integration reference, not a supported deployment recipe.

Before production use, provide external secret management, TLS termination, durable storage, tested health checks, a safe notebook executor, database migrations, resource limits, backup restoration tests, and monitoring.
