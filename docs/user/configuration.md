# Configuration

BitsyGrader reads a Python configuration file through Traitlets. This page starts with a working configuration and then documents the settings an operator is likely to change.

## Minimal configuration

```python
from traitlets.config import get_config
from bitsygrader.config.config import AutogradeConfig, DatabaseConfig

c = get_config()

database = DatabaseConfig()
database.uri = "sqlite:////var/lib/bitsygrader/bitsygrader.db"
database.asset_path = "/var/lib/bitsygrader/assets"
c.BitsyGraderConfig.database = database

autograde = AutogradeConfig()
autograde.enabled = True
autograde.workers = 1
autograde.executor_class = (
    "bitsygrader.autograde.executors.simple.SimpleExecutor"
)
c.BitsyGraderConfig.autograde = autograde
```

Start the service with:

```bash
bitsygrader serve --config /etc/bitsygrader/bitsygrader_config.py
```

The `bgrader` command is an alias for the same CLI, so `bgrader serve --config /etc/bitsygrader/bitsygrader_config.py` is equivalent. Python imports, configuration classes, environment variables, Jupyter extension IDs, and service URLs use the full name: `bitsygrader`, `BitsyGraderConfig`, and `BITSYGRADER_*`.

Create the database and asset directories first and grant write access to the service account.

!!! danger "The simple executor is for development"

    `SimpleExecutor` runs submitted code inside the BitsyGrader service process. Use an [isolated executor](administration/autograding.md) before accepting untrusted submissions.

## Connect an LMS

The exact endpoint values come from the LMS registration. The following example shows the Moodle adapter:

```python
from bitsygrader.config.config import LTIConfig

lti = LTIConfig()
lti.enabled = True
lti.platform = "moodle"
lti.client_id = "<client-id>"
lti.lms_url = "https://moodle.example.edu"
lti.token_url = "https://moodle.example.edu/mod/lti/token.php"
lti.lti_url = "https://moodle.example.edu/mod/lti/services.php"
lti.nrps_url = "https://moodle.example.edu/mod/lti/services.php"
lti.key_path = "/etc/bitsygrader/private.pem"
lti.sync_task.enabled = True
lti.sync_task.interval = "5m"
c.BitsyGraderConfig.lti = lti
```

Keep the private key outside the repository and readable only by the service account. See [LMS integration](administration/lti.md) for the synchronization flow and [Connect Moodle](lms/moodle.md) for the complete Moodle registration.

## Command-line options

| Option | Default | Purpose |
| --- | --- | --- |
| `--config` | `bitsygrader_config.py` | Traitlets configuration file |
| `--host` | `localhost` | Bind address when `JUPYTERHUB_SERVICE_URL` is absent |
| `--port` | `12345` | Bind port when `JUPYTERHUB_SERVICE_URL` is absent |

## Database settings

| Setting | Default | Purpose |
| --- | --- | --- |
| `uri` | `sqlite:///bitsygrader.db` | SQLAlchemy database URI |
| `echo` | `false` | Log SQL queries |
| `asset_path` | `assets` | Storage directory for assignment assets |

Use absolute paths in a service deployment. Back up the asset directory together with the database.

## Autograding settings

| Setting | Default | Purpose |
| --- | --- | --- |
| `enabled` | `false` | Intended autograding feature switch |
| `workers` | `16` | Number of in-process queue consumers |
| `cooldown_period` | `1h` | Reserved resubmission cooldown; not yet enforced |
| `executor_class` | empty | Dotted import path of the executor class |

!!! note "Current behavior"

    The service currently starts the autograding subsystem even when `enabled` is false, so `executor_class` must still be configured.

## LTI settings

| Setting | Default | Purpose |
| --- | --- | --- |
| `enabled` | `false` | Initialize the LTI client |
| `platform` | `moodle` | Platform adapter: `moodle` or `canvas` |
| `lms_url` | empty | Platform issuer or base URL |
| `client_id` | empty | OAuth/LTI client ID |
| `token_url` | empty | OAuth client-credentials token endpoint |
| `key_path` | empty | RSA private-key file |
| `lti_url` | empty | Base URL for LTI service calls |
| `nrps_url` | empty | Optional NRPS-specific base URL |
| `sync_task.enabled` | `false` | Schedule roster synchronization |
| `sync_task.interval` | `5m` | Synchronization interval using `m`, `h`, or `d` |

## JupyterHub environment

| Variable | Purpose |
| --- | --- |
| `JUPYTERHUB_API_TOKEN` | Authenticates service calls to JupyterHub and local proxy calls to BitsyGrader |
| `JUPYTERHUB_API_URL` | JupyterHub REST API base URL |
| `JUPYTERHUB_SERVICE_PREFIX` | Public URL prefix mounted by JupyterHub |
| `JUPYTERHUB_SERVICE_URL` | Internal address on which BitsyGrader listens |
| `BITSYGRADER_SERVICE_EXTERNAL_URL` | Explicit URL used by the Jupyter Server bridge |
| `JUPYTERHUB_HOST` | Fallback host used to construct the service URL |
| `JUPYTERHUB_PROXY_PORT` | Optional fallback proxy port |

When JupyterHub starts BitsyGrader as a managed service, it supplies the `JUPYTERHUB_*` variables automatically.

## Observability environment

Install `bitsygrader[sentry]` or `bitsygrader[opentelemetry]` before enabling that integration.

| Variable | Default | Purpose |
| --- | --- | --- |
| `SENTRY_DSN` | unset | Enable Sentry |
| `SENTRY_RELEASE` | package version | Release name |
| `SENTRY_ENV` | `development` | Environment name |
| `SENTRY_TRACES_SAMPLE_RATE` | `0.05` | Trace sampling rate |
| `SENTRY_PROFILES_SAMPLE_RATE` | `0` | Profile sampling rate |
| `SENTRY_SEND_PII` | `false` | Allow default personally identifiable information |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | unset | Enable OpenTelemetry export |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | `grpc` | `grpc`, `http`, or `http/protobuf` |
| `OTEL_EXPORTER_OTLP_HEADERS` | unset | Comma-separated exporter headers |
| `OTEL_SERVICE_NAME` | `bitsygrader` | OpenTelemetry service name |
| `OTEL_SERVICE_VERSION` | unset | Service version |
| `OTEL_EXPORTER_CONSOLE` | `false` | Also emit spans to the console |
