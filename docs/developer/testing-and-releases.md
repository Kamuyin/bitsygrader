# Testing and releases

## Current state

Pytest is configured with unit, integration, contract, API, security, performance, authentication, database, and asyncio markers. The repository does not yet contain test modules, so establishing a test baseline is a priority. I am happy about anybody who could assist there ;-)

## Recommended validation

```bash
uv run pytest
uv run python -m compileall -q bytegrader executors/systemd/bytegrader_systemd
jlpm build:lib
uv run mkdocs build --strict
```

High-value test areas are:

1. permission policy matrices for administrators, instructors, and students;
2. notebook preprocessing and reconstruction round trips;
3. submission matching, resubmission, due dates, and grade aggregation;
4. handler contracts, including multipart fetch/create/submit;
5. path traversal and upload validation in the Jupyter Server bridge;
6. executor failure, timeout, queue, and persistence behavior;
7. Moodle and Canvas LTI payload parsing.

## Release artifacts

The root package produces the `bytegrader` Python distribution and bundled JupyterLab extension. Tags matching `v*` trigger the PyPI publishing workflow.

The systemd executor is a separate workspace package under `executors/systemd`; tags matching `systemd-v*` publish it independently.

Keep these versions aligned where relevant:

- `pyproject.toml` for the Python package;
- `bytegrader.__version__`;
- `package.json` for the frontend;
- `executors/systemd/pyproject.toml` for the executor;
- `uv.lock` after workspace metadata changes.

The current repository contains version drift between several of these locations, so verify every artifact explicitly before the next release.

