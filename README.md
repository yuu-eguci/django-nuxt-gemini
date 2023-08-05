django-nuxt-gemini ♊
===

✌🏽✌🏽 🐍 🐳 🇳 Python 3.10 + Django v4 + Yarn + Nuxt v2 + Nginx + Docker | Nuxt.js も使いてーし、 Django も使いてーけど、サーバはふたつも使いたくねーから、 Django から Nuxt.js を配信しよーぜ。あと Docker は当然使うぜ。でもあとで学んだんだけど、 "Django から Nuxt.js を配信" ってのはおかしくて、実際は "Nginx を使って Django と Nuxt.js を同ドメインで配信しよーぜ" だよ。

- python + django + yarn + nuxt + nginx なんつー container を用意して、
- 開発環境では runserver (8000 -> 8081) と yarn dev (3000 -> 3001) で開発して、
- 実働環境では
    - nuxt は yarn generate で静的サイトにして、 nginx (8080/ -> 8081) で配信して、
    - django は nginx と gunicorn (8081/api/ -> 8080 -> 8000) で配信するよ!

## runserver と yarn dev で起動するところまで

```bash
# Create containers
docker compose up -d

# Get into webapp-service
docker compose exec webapp-service sh
# Check↓
python -V
# --> Python 3.10.12
pipenv --version
# --> pipenv, version 2023.7.23
yarn -v
# --> 1.22.19
create-nuxt-app -v
# --> create-nuxt-app/5.0.0 linux-x64 node-v18.17.0

# Django のほう。
pipenv run python manage.py runserver 0.0.0.0:8000
# --> http://localhost:8001/

# Nuxt.js のほう。
cd ./frontend-nuxt; yarn dev --hostname 0.0.0.0
# --> http://localhost:3001/
```

## Nuxt.js を静的サイトとして nginx で配信する

ここまで出来たよ!

![](docs/(2023-08-04)8081-8080-8000-system.png)

- `runserver` のとき: Container の外側 (8001) -> Django (8000) という流れ。
- `nginx` のとき: Container の外側 (8081) -> Nginx (8080) -> Gunicorn (8000) という流れになるよ。

```bash
docker compose exec webapp-service sh

# Nuxt.js の静的サイトを生成。
cd /webapp/frontend-nuxt; BASE_URL=/ yarn generate
mkdir -p /webapp/static; cp -r /webapp/frontend-nuxt/dist/* /webapp/static/

# wsgi で django を起動する。
# 主に admin のために collectstatic を実行する。
pipenv run python manage.py collectstatic --noinput
pipenv run gunicorn --bind 0.0.0.0:8000 config.wsgi:application

# nginx の設定を更新。
cp /webapp/nginx.conf /etc/nginx/http.d/default.conf
# nginx の設定ファイルをテスト。
nginx -t
# nginx を起動。
nginx
# nginx を再起動。
nginx -s reload

# --> http://localhost:8081/
```
