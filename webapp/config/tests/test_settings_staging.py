"""
config.tests.test_settings_staging
"""

import importlib
import os
from unittest import mock

from django.test import SimpleTestCase


def load_settings_staging():
    # NOTE: settings はモジュールの読み込み時に env を読むので、毎回読み込み直します。
    from .. import settings_staging

    return importlib.reload(settings_staging)


class SettingsStagingTests(SimpleTestCase):

    def test_debug_is_off(self) -> None:
        with mock.patch.dict(os.environ, {'DJANGO_ALLOWED_HOSTS': 'example.com'}):
            self.assertFalse(load_settings_staging().DEBUG)

    def test_allowed_hosts_from_env(self) -> None:
        with mock.patch.dict(os.environ, {'DJANGO_ALLOWED_HOSTS': 'example.com, localhost'}):
            self.assertEqual(load_settings_staging().ALLOWED_HOSTS, ['example.com', 'localhost'])

    def test_allowed_hosts_is_required(self) -> None:
        # ALLOWED_HOSTS の指定漏れは、起動時のエラーで気づけるようにします。
        env = {key: value for key, value in os.environ.items() if key != 'DJANGO_ALLOWED_HOSTS'}
        with mock.patch.dict(os.environ, env, clear=True):
            with self.assertRaises(KeyError):
                load_settings_staging()
