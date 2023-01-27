"""Tests for kernel connection utilities"""
# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.
import json
import os
from tempfile import TemporaryDirectory

import pytest
from jupyter_core.application import JupyterApp
from jupyter_core.paths import jupyter_runtime_dir

from jupyter_client import connect
from jupyter_client import KernelClient
from jupyter_client import KernelManager
from jupyter_client.consoleapp import JupyterConsoleApp
from jupyter_client.session import Session


class TemporaryWorkingDirectory(TemporaryDirectory):
    """
    Creates a temporary directory and sets the cwd to that directory.
    Automatically reverts to previous cwd upon cleanup.
    Usage example:

        with TemporaryWorkingDirectory() as tmpdir:
            ...
    """

    def __enter__(self):
        self.old_wd = os.getcwd()
        os.chdir(self.name)
        return super().__enter__()

    def __exit__(self, exc, value, tb):
        os.chdir(self.old_wd)
        return super().__exit__(exc, value, tb)


class DummyConsoleApp(JupyterApp, JupyterConsoleApp):
    def initialize(self, argv=None):
        JupyterApp.initialize(self, argv=argv or [])
        self.init_connection_file()


class DummyConfigurable(connect.ConnectionFileMixin):
    def initialize(self):
        pass


sample_info = dict(
    ip="1.2.3.4",
    transport="ipc",
    shell_port=1,
    hb_port=2,
    iopub_port=3,
    stdin_port=4,
    control_port=5,
    key=b"abc123",
    signature_scheme="hmac-md5",
    kernel_name="python",
)

sample_info_kn = dict(
    ip="1.2.3.4",
    transport="ipc",
    shell_port=1,
    hb_port=2,
    iopub_port=3,
    stdin_port=4,
    control_port=5,
    key=b"abc123",
    signature_scheme="hmac-md5",
    kernel_name="test",
)


def test_write_connection_file():
    with TemporaryDirectory() as d:
        cf = os.path.join(d, "kernel.json")
        connect.write_connection_file(cf, **sample_info)
        assert os.path.exists(cf)
        with open(cf, "r") as f:
            info = json.load(f)
    info["key"] = info["key"].encode()
    assert info == sample_info


def test_load_connection_file_session():
    """test load_connection_file() after"""
    session = Session()
    app = DummyConsoleApp(session=Session())
    app.initialize(argv=[])
    session = app.session

    with TemporaryDirectory() as d:
        cf = os.path.join(d, "kernel.json")
        connect.write_connection_file(cf, **sample_info)
        app.connection_file = cf
        app.load_connection_file()

    assert session.key == sample_info["key"]
    assert session.signature_scheme == sample_info["signature_scheme"]


def test_load_connection_file_session_with_kn():
    """test load_connection_file() after"""
    session = Session()
    app = DummyConsoleApp(session=Session())
    app.initialize(argv=[])
    session = app.session

    with TemporaryDirectory() as d:
        cf = os.path.join(d, "kernel.json")
        connect.write_connection_file(cf, **sample_info_kn)
        app.connection_file = cf
        app.load_connection_file()

    assert session.key == sample_info_kn["key"]
    assert session.signature_scheme == sample_info_kn["signature_scheme"]


def test_app_load_connection_file():
    """test `ipython console --existing` loads a connection file"""
    with TemporaryDirectory() as d:
        cf = os.path.join(d, "kernel.json")
        connect.write_connection_file(cf, **sample_info)
        app = DummyConsoleApp(connection_file=cf)
        app.initialize(argv=[])

    for attr, expected in sample_info.items():
        if attr in ("key", "signature_scheme"):
            continue
        value = getattr(app, attr)
        assert value == expected, "app.%s = %s != %s" % (attr, value, expected)


def test_load_connection_info():
    client = KernelClient()
    info = {
        "control_port": 53702,
        "hb_port": 53705,
        "iopub_port": 53703,
        "ip": "0.0.0.0",
        "key": "secret",
        "shell_port": 53700,
        "signature_scheme": "hmac-sha256",
        "stdin_port": 53701,
        "transport": "tcp",
    }
    client.load_connection_info(info)
    assert client.control_port == info["control_port"]
    assert client.session.key.decode("ascii") == info["key"]
    assert client.ip == info["ip"]


def test_find_connection_file():
    with TemporaryDirectory() as d:
        cf = "kernel.json"
        app = DummyConsoleApp(runtime_dir=d, connection_file=cf)
        app.initialize()

        security_dir = app.runtime_dir
        profile_cf = os.path.join(security_dir, cf)

        with open(profile_cf, "w") as f:
            f.write("{}")

        for query in (
            "kernel.json",
            "kern*",
            "*ernel*",
            "k*",
        ):
            assert connect.find_connection_file(query, path=security_dir) == profile_cf


def test_find_connection_file_local():
    with TemporaryWorkingDirectory():
        cf = "test.json"
        abs_cf = os.path.abspath(cf)
        with open(cf, "w") as f:
            f.write("{}")

        for query in (
            "test.json",
            "test",
            abs_cf,
            os.path.join(".", "test.json"),
        ):
            assert connect.find_connection_file(query, path=[".", jupyter_runtime_dir()]) == abs_cf


def test_find_connection_file_relative():
    with TemporaryWorkingDirectory():
        cf = "test.json"
        os.mkdir("subdir")
        cf = os.path.join("subdir", "test.json")
        abs_cf = os.path.abspath(cf)
        with open(cf, "w") as f:
            f.write("{}")

        for query in (
            os.path.join(".", "subdir", "test.json"),
            os.path.join("subdir", "test.json"),
            abs_cf,
        ):
            assert connect.find_connection_file(query, path=[".", jupyter_runtime_dir()]) == abs_cf


def test_find_connection_file_abspath():
    with TemporaryDirectory():
        cf = "absolute.json"
        abs_cf = os.path.abspath(cf)
        with open(cf, "w") as f:
            f.write("{}")
        assert connect.find_connection_file(abs_cf, path=jupyter_runtime_dir()) == abs_cf
        os.remove(abs_cf)


def test_mixin_record_random_ports():
    with TemporaryDirectory() as d:
        dc = DummyConfigurable(data_dir=d, kernel_name="via-tcp", transport="tcp")
        dc.write_connection_file()

        assert dc._connection_file_written
        assert os.path.exists(dc.connection_file)
        assert dc._random_port_names == connect.port_names


def test_mixin_cleanup_random_ports():
    with TemporaryDirectory() as d:
        dc = DummyConfigurable(data_dir=d, kernel_name="via-tcp", transport="tcp")
        dc.write_connection_file()
        filename = dc.connection_file
        dc.cleanup_random_ports()

        assert not os.path.exists(filename)
        for name in dc._random_port_names:
            assert getattr(dc, name) == 0


param_values = [
    (True, True),
    (True, False),
    (False, True),
    (False, False),
]


@pytest.mark.parametrize("file_exists, km_matches", param_values)
def test_reconcile_connection_info(file_exists, km_matches):

    expected_info = sample_info
    mismatched_info = sample_info.copy()
    mismatched_info["key"] = b"def456"
    mismatched_info["shell_port"] = expected_info["shell_port"] + 42
    mismatched_info["control_port"] = expected_info["control_port"] + 42

    with TemporaryDirectory() as connection_dir:

        cf = os.path.join(connection_dir, "kernel.json")
        km = KernelManager()
        km.connection_file = cf

        if file_exists:
            _, info = connect.write_connection_file(cf, **expected_info)
            info["key"] = info["key"].encode()  # set 'key' back to bytes

            if km_matches:
                # Let this be the case where the connection file exists, and the KM has matching
                # values prior to reconciliation.  This is the LocalProvisioner case.
                provisioner_info = info
                km.load_connection_info(provisioner_info)
            else:
                # Let this be the case where the connection file exists, and the KM has those values
                # that differ from the ones returned by the provisioner.  This is the restart-with-
                # changed-ports case (typical for remote provisioners).
                km.load_connection_info(expected_info)
                provisioner_info = mismatched_info
        else:  # connection file does not exist
            if km_matches:
                # Let this be the case where the connection file does not exist, NOR does the KM
                # have any values of its own and reconciliation sets those values. This is the
                # non-LocalProvisioner case.
                provisioner_info = expected_info
            else:
                # Let this be the case where the connection file does not exist, yet the KM
                # has values that do not match those returned from the provisioner.  This case
                # is probably not practical and is equivalent to the True, False case.
                km.load_connection_info(expected_info)
                provisioner_info = mismatched_info

        km._reconcile_connection_info(provisioner_info)
        km_info = km.get_connection_info()
        assert km._equal_connections(km_info, provisioner_info)
