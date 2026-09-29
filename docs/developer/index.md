# Developer documentation

This section is for contributors changing BitsyGrader's Python service, Jupyter extensions, execution backends, data model, or documentation.

## Prerequisites

- Python 3.10+
- [uv](https://docs.astral.sh/uv/)
- Node.js 18+ with Corepack
- JupyterLab 4

## Install

```bash
uv sync --group dev
corepack enable
jlpm install
uv pip install -e .
jupyter server extension enable bitsygrader --sys-prefix
jupyter labextension develop . --overwrite
```

## Build and watch the frontend

```bash
jlpm build
```

For iterative work:

```bash
jlpm watch
```

Restart JupyterLab after changing Python server-extension code. TypeScript changes are rebuilt by the watcher, though a browser refresh may still be required.

## Run the service

Use the example configuration as a starting point, replace its credentials, and export the JupyterHub service variables described in [Installation](../user/installation.md).

```bash
uv run bitsygrader serve --config example/bitsygrader_config.py
```

The example simple executor is intentionally unsafe and should only process notebooks you trust.
