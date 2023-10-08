django-nuxt-gemini ♊
===

TODO: 開発環境で、 3001 -> 8001 するところまでは完成済み。
      8081 のみで動かすところが未完成。具体的には django 側に本番用の settings が必要。

✌🏽✌🏽 🐍 🐳 🇳 Python 3.10 + Django v4 + Yarn + Nuxt v2 + Nginx + Docker | Nuxt.js も使いてーし、 Django も使いてーけど、サーバはふたつも使いたくねーから、 Django から Nuxt.js を配信しよーぜ。あと Docker は当然使うぜ。でもあとで学んだんだけど、 "Django から Nuxt.js を配信" ってのはおかしくて、実際は "Nginx を使って Django と Nuxt.js を同ドメインで配信しよーぜ" だよ。

- python + django + yarn + nuxt + nginx なんつー container を用意して、
- 開発環境では runserver (8000 -> 8081) と yarn dev (3000 -> 3001) で開発して、
- 実働環境では
    - nuxt は yarn generate で静的サイトにして、 nginx (8080/ -> 8081) で配信して、
    - django は nginx と gunicorn (8081/api/ -> 8080 -> 8000) で配信するよ!

![](docs/(2023-08-05)overall-view.png)

## コイツのいいところ

- Docker 環境 + Django + Nuxt.js (frontend) + MySQL がひとつのリポジトリに詰まっててシンプルだよ。
    - まあいいことばかりじゃないけど。
- up で3つ一気に立ち上がるよ。

Django エリアのいいところ

- 開発環境用、本番環境用の settings が分かれてるよ。
- 当然 Pipenv で管理できてるよ。
- コンソールと、 ./logs/ へのロギングができてるよ。ロギングの日時は UTC と JST を選べる。

Nuxt.js エリアのいいところ

Nginx エリアのいいところ

## runserver と yarn dev で起動するところまで

```bash
# Just for the first installation.
cp ./local.env ./.env

# Create containers
docker compose up -d

# Get into webapp-service
# NOTE: It's a good practice to have separate terminals for Django and Nuxt.js for easier debugging and log tracking.
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
(cd ./frontend-nuxt; yarn list nuxt)
# --> └─ nuxt@2.17.1
# NOTE: warning が出るけど、それは完全一致検索を欠く yarn list が悪い。

# Django のほう。
pipenv sync --dev
pipenv run python manage.py migrate
pipenv run python manage.py runserver 0.0.0.0:8000
# --> http://localhost:8001/ でアクセス。

# Nuxt.js のほう。
(cd ./frontend-nuxt; yarn install)
(cd ./frontend-nuxt; yarn dev --hostname 0.0.0.0)
# --> http://localhost:3001/ でアクセス。
```

## Nuxt.js を静的サイトとして nginx で配信する

ここまで出来たよ!

![](docs/(2023-08-04)8081-8080-8000-system.png)

- `runserver` のとき: Container の外側 (8001) -> Django (8000) という流れ。
- `nginx` のとき: Container の外側 (8081) -> Nginx (8080) -> Gunicorn (8000) という流れになるよ。

## VSCode を使っているなら settings.json にコレ書いとくとヨシ

"container 内仮想環境にある python modules の中身へ F12 でジャンプできない" 問題をこれで回避できる。

```json
{
    "python.autoComplete.extraPaths": ["${workspaceFolder}/webapp/.venv/lib/python*/site-packages"]
}
```
