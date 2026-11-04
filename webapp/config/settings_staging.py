import os

from .settings import *  # noqa: F401, F403

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'middlewares.request_id_middleware.RequestIDMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

DEBUG = False

# 配信に使うホスト名を env の DJANGO_ALLOWED_HOSTS にカンマ区切りで指定します。 (例: example.com,localhost)
ALLOWED_HOSTS = [host.strip() for host in os.environ['DJANGO_ALLOWED_HOSTS'].split(',')]
