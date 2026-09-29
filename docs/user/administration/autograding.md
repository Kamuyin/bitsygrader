# Autograding executors

The executor is selected with a dotted Python class path. Every executor implements asynchronous notebook execution and returns a mapping from cell ID to success, output, and error information.

## Simple executor

```python
autograde.executor_class = "bitsygrader.autograde.executors.simple.SimpleExecutor"
```

`SimpleExecutor` calls Python `exec()` inside the service process. It is convenient for development and demonstrations but provides no isolation.

!!! danger

    Never use the simple executor for untrusted submissions. Student code can access the service process, filesystem, network, environment variables, and credentials.

## systemd executor

```python
autograde.executor_class = "bitsygrader.autograde.executors.systemd.SystemdExecutor"
```

Install the optional package with the `systemd` extra. It creates a per-job bundle and executes a notebook in a transient systemd unit using controls such as `DynamicUser`, `PrivateTmp`, `ProtectHome`, and `NoNewPrivileges`.

Important settings include the bundle root, runtime directory, runner entrypoint, timeout, unit slice, and whether artifacts are preserved. This executor requires Linux with systemd and permissions to launch transient units.

Review and extend the unit properties for your threat model. The current defaults still permit IPv4 and IPv6 address families and should not be treated as a complete network sandbox.

## WASM executor

The experimental WASM executor runs a Python WASM module with a configured standard-library directory and memory limit. It is incomplete: cell-level execution is not implemented and the generated script is explicitly marked as needing injection hardening.

!!! info
    ## Implement your own :-)
    The autograding executors are built on top of a modular system, meaning that you can develop your own that fits your environment specifically. Like for k8s for example.