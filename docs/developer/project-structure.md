# Project structure

```text
bytegrader/
├── bytegrader/                 Python service and server extension
│   ├── autograde/              Queue, workers, and executor adapters
│   ├── cli/                    `bytegrader serve` entry point
│   ├── config/                 Traitlets configuration
│   ├── core/                   Auth, database, models, LTI, observability
│   ├── extensions/lab/         Per-user Jupyter Server bridge
│   ├── handlers/               Central Tornado HTTP handlers
│   ├── preprocessors/          Student-notebook transformations
│   ├── repositories/           Database access
│   ├── schemas/                Pydantic API schemas
│   ├── services/               Business workflows
│   └── tasks/                  Scheduler and LTI roster synchronization
├── executors/systemd/          Separately packaged Linux executor
├── src/                        JupyterLab TypeScript/React extension
│   ├── assignment-creation/    Cell metadata overlay
│   ├── components/             UI5 React views and dialogs
│   ├── services/               Browser API client
│   ├── stores/                 Zustand state
│   └── widgets/                JupyterLab widget adapters
├── docs/                       MkDocs content and images
├── docker/                     Deployment scaffolding
├── example/                    Local example configuration
├── mkdocs.yml                  Documentation site configuration
├── pyproject.toml              Python package and workspace
└── package.json                Labextension package and scripts
```

The structure of the repository was inspired by nbgrader's repository. See: <https://github.com/jupyter/nbgrader/>