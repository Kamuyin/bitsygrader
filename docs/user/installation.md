# Install BYTEGrader

This guide installs BYTEGrader and JupyterHub on a Linux server.

After this guide succeeds, continue with [LMS integrations](lms/index.md).

## Deployment layout

The examples use these paths and addresses:

| Component | Example |
| --- | --- |
| Public JupyterHub URL | `https://jupyter.example.org` |
| Internal BYTEGrader service | `http://127.0.0.1:10101` |
| JupyterHub configuration | `/etc/jupyterhub/jupyterhub_config.py` |
| BYTEGrader configuration | `/etc/bytegrader/bytegrader_config.py` |
| JupyterHub working directory | `/var/jupyterhub` |
| BYTEGrader data | `/var/lib/bytegrader` |

The setup uses SystemdSpawner to run each JupyterLab server in a transient systemd unit. JupyterHub must therefore run as `root`; unrestricted access to `systemd-run` is effectively equivalent to root access. SystemdSpawner recommends systemd 245 or newer.

## 1. Install system dependencies

JupyterHub requires Node.js and Configurable HTTP Proxy:

```bash
apt update
apt install nodejs npm
npm install -g configurable-http-proxy
```

Install JupyterHub, JupyterLab, the LTI authenticator, SystemdSpawner, and the idle culler into the same system-wide Python environment:

=== "uv"

    ```bash
    uv pip install \
      jupyterhub \
      jupyterlab \
      notebook \
      jupyterhub-ltiauthenticator \
      jupyterhub-systemdspawner \
      jupyterhub-idle-culler \
      --system
    ```

=== "pip"

    ```bash
    python3 -m pip install --no-cache-dir \
      jupyterhub \
      jupyterlab \
      notebook \
      jupyterhub-ltiauthenticator \
      jupyterhub-systemdspawner \
      jupyterhub-idle-culler
    ```

Optional JupyterLab language packs can be installed into the same environment:

```bash
uv pip install \
  jupyterlab-language-pack-de-DE \
  jupyterlab-language-pack-uk-UA \
  --system
```

## 2. Install BYTEGrader

Install the current project from its repository:

```bash
git clone https://github.com/Kamuyin/bytegrader.git
cd bytegrader
corepack enable
uv pip install . --system
```

Enable the Jupyter Server and JupyterLab extensions in the environment used by the user servers:

```bash
jupyter server extension enable bytegrader --sys-prefix
jupyter server extension list
jupyter labextension list
```

## 3. Create directories and configuration

```bash
install -d -m 700 /etc/jupyterhub
install -d -m 700 /etc/bytegrader
install -d -m 700 /var/jupyterhub
install -d -m 700 /var/lib/bytegrader
install -d -m 700 /var/lib/bytegrader/assets
```

Create `/etc/bytegrader/bytegrader_config.py`:

```python
from traitlets.config import get_config

from bytegrader.config.config import AutogradeConfig, DatabaseConfig

c = get_config()

database = DatabaseConfig()
database.uri = "sqlite:////var/lib/bytegrader/bytegrader.db"
database.asset_path = "/var/lib/bytegrader/assets"
c.BYTEGraderConfig.database = database

autograde = AutogradeConfig()
autograde.enabled = True
autograde.workers = 4
autograde.executor_class = (
    "bytegrader.autograde.executors.simple.SimpleExecutor"
)
c.BYTEGraderConfig.autograde = autograde
```

```bash
chmod 600 /etc/bytegrader/bytegrader_config.py
```

!!! danger "Choose a safe executor"

    `SimpleExecutor` executes submissions inside the BYTEGrader service process. It is suitable only for trusted development input. Configure an isolated [autograding executor](administration/autograding.md) before accepting student code.

The [configuration guide](configuration.md) documents database, executor, environment, and observability settings.

## 4. Configure JupyterHub

Create `/etc/jupyterhub/jupyterhub_config.py`:

```python
import sys

c = get_config()  # noqa: F821

c.JupyterHub.ip = "0.0.0.0"
c.JupyterHub.port = 8000
c.ConfigurableHTTPProxy.wait_for_start_timeout = 60

c.JupyterHub.spawner_class = "systemd"
c.Spawner.disable_user_config = True

c.SystemdSpawner.dynamic_users = True
c.SystemdSpawner.mem_limit = "1024M"
c.SystemdSpawner.cpu_limit = 0.5
c.SystemdSpawner.default_shell = "/bin/bash"
c.SystemdSpawner.isolate_devices = True
c.SystemdSpawner.isolate_tmp = True
c.SystemdSpawner.disable_user_sudo = True
c.SystemdSpawner.readonly_paths = ["/"]
c.SystemdSpawner.unit_extra_properties = {
    "IPAddressAllow": "localhost",
    "IPAddressDeny": "any",
    "RuntimeDirectoryPreserve": "no",
}
```

`IPAddressDeny=any` blocks internet access from user servers. Confirm that JupyterHub and required internal services remain reachable before enabling it. Explicitly allow their addresses when they run on another host.

!!! info "Known SystemdSpawner restart problem"

    An [open SystemdSpawner issue](https://github.com/jupyterhub/systemdspawner/issues/76) documents stale state below `/run` that can prevent a stopped user server from starting again. `RuntimeDirectoryPreserve=no` is a reported workaround.

### Register BYTEGrader as a managed service

Append this to the same JupyterHub configuration:

```python
c.JupyterHub.services = [
    {
        "name": "bytegrader",
        "url": "http://127.0.0.1:10101",
        "command": [
            sys.executable,
            "-m",
            "bytegrader",
            "serve",
            "--config=/etc/bytegrader/bytegrader_config.py",
        ],
        "cwd": "/var/lib/bytegrader",
    }
]

c.JupyterHub.load_roles = [
    {
        "name": "user",
        "scopes": [
            "self",
            "access:services!service=bytegrader",
            "read:users:name!user",
            "read:users:groups!user",
            "access:servers!user",
        ],
    },
    {
        "name": "server",
        "scopes": [
            "access:servers!user",
            "read:users:activity!user",
            "users:activity!user",
            "admin:auth_state!user",
            "access:services!service=bytegrader",
        ],
    },
    {
        "name": "bytegrader-role",
        "scopes": [
            "read:users:name",
            "admin:auth_state",
            "access:services!service=bytegrader",
            "read:users",
            "list:users",
        ],
        "services": ["bytegrader"],
    },
]
```

JupyterHub supplies managed services with `JUPYTERHUB_API_TOKEN`, `JUPYTERHUB_API_URL`, `JUPYTERHUB_SERVICE_PREFIX`, and `JUPYTERHUB_SERVICE_URL` automatically.

### Stop inactive user servers

Append the idle culler to the existing service and role lists:

```python
c.JupyterHub.services.append(
    {
        "name": "idle-culler",
        "command": [
            sys.executable,
            "-m",
            "jupyterhub_idle_culler",
            "--timeout=3600",
        ],
    }
)

c.JupyterHub.load_roles.append(
    {
        "name": "idle-culler-role",
        "scopes": ["read:users:activity", "servers"],
        "services": ["idle-culler"],
    }
)
```

Do not assign `c.JupyterHub.services` or `c.JupyterHub.load_roles` again later; doing so replaces these entries.

## 5. Run JupyterHub with systemd

Generate the Hub cryptographic key:

```bash
openssl rand -hex 32
```

Write it to `/etc/jupyterhub/jupyterhub.env`:

```text
JUPYTERHUB_CRYPT_KEY=<NEWLY-GENERATED-HEX-VALUE>
```

```bash
chmod 600 /etc/jupyterhub/jupyterhub.env
```

Create `/etc/systemd/system/jupyterhub.service`:

```ini
[Unit]
Description=JupyterHub
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
EnvironmentFile=/etc/jupyterhub/jupyterhub.env
Environment="PATH=/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin"
WorkingDirectory=/var/jupyterhub
ExecStart=/usr/local/bin/jupyterhub -f /etc/jupyterhub/jupyterhub_config.py
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

Check the executable path with `command -v jupyterhub` and adjust `ExecStart` if necessary. Then start the service:

```bash
systemctl daemon-reload
systemctl enable --now jupyterhub.service
systemctl status jupyterhub.service
```

## 6. Verify the base installation

Before connecting an LMS, verify that:

1. JupyterHub starts without configuration errors.
2. BYTEGrader appears as a running managed service in the Hub logs.
3. A test user server starts successfully.
4. The **BYTE Grader** menu appears in JupyterLab.
5. `jupyter server extension list` reports the BYTEGrader extension as enabled.

Useful diagnostic commands:

```bash
journalctl -u jupyterhub.service --since today
systemctl list-units 'jupyter-*-singleuser.service'
systemd-cgtop
jupyter server extension list
jupyter labextension list
```

## Next step

Choose an [LMS integration guide](lms/index.md). It will add the platform-specific authenticator configuration and BYTEGrader LTI endpoints to the base configuration created here.

## Further reading

- [SystemdSpawner](https://github.com/jupyterhub/systemdspawner)
- [JupyterHub services](https://jupyterhub.readthedocs.io/en/stable/reference/services.html)
- [JupyterHub Idle Culler](https://github.com/jupyterhub/jupyterhub-idle-culler)
- [systemd resource control](https://www.freedesktop.org/software/systemd/man/latest/systemd.resource-control.html)
