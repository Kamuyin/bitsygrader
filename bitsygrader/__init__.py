from typing import List, Dict

from .extensions.lab import load_jupyter_server_extension as load_lab_extension

__version__ = '0.0.1'

def _jupyter_labextension_paths() -> List[Dict[str, str]]:
    return [{
        "src": "extensions/labextension",
        "dest": "@bytechallenge/bitsygrader",
    }]


def _jupyter_server_extension_points() -> List[Dict[str, str]]:
    return [{
        "module": "bitsygrader",
    }]


def _load_jupyter_server_extension(app):
    load_lab_extension(app)


__all__ = [
    '__version__',
    '_jupyter_labextension_paths',
    '_jupyter_server_extension_points',
    '_load_jupyter_server_extension',
]
