# `systemd` Autograde-Executor for BitsyGrader

## Overview

The `bitsygrader-executor-systemd` package provides an execution environment for running student notebook submissions in the BitsyGrader autograding system. It uses Linux systemd's transient units and isolation features to execute Jupyter notebooks with process isolation and resource management. Its Python module is `bitsygrader_systemd`, and it can also be installed through the main package's `systemd` extra: `pip install "bitsygrader[systemd]"`.
