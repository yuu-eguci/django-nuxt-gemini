django-nuxt-gemini ♊
===

TODO: 開発環境で、 3001 -> 8001 するところまでは完成済み。
      8081 のみで動かすところが未完成。具体的には django 側に本番用の settings が必要。

✌🏽✌🏽 🐍 🐳 🇳 Python 3.10 + Django v4 + Yarn + Nuxt v2 + Nginx + Docker + GitHub Actions + Ruff + CI/CD | Nuxt.js も使いてーし、 Django も使いてーけど、サーバはふたつも使いたくねーから、 Nginx を使って Django と Nuxt.js を同ドメインで配信しよーぜ。あと Docker は当然使うぜ。

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
- ユニットテストの基礎もちゃんとあるよ。
- ひさしぶりに来て、 "view どんなふうに書くんだっけ?" ってなったときのため views に view のベースを書いてるよ。
    - 最近、 async の view も足しといたよ。ただ動かすにはこれ↓が必要かも
    - uvicorn (asgi サーバ) を pip install
    - gunicorn が内蔵の wsgi サーバのみならず uvicorn を動かせるように設定する
    - そうすると gunicorn が uvicorn を worker として動かして、
    - uvicorn は asgi サーバとして django を配信してくれる!
- GitHub Actions で ruff, test がちゃんと走るよ。
- プロジェクト内部のモジュールをインポートするときは、つねに相対インポートを使ってる (3rd party との区別のため) よ。

Nuxt.js エリアのいいところ

- GitHub Actions で eslint, test がちゃんと走るよ。

Nginx エリアのいいところ

いいことばかりじゃないところ

- 1アプリケーションにつき1 docker container を使うと、 VSCode 開発のときに devcontainer をキレイに使えたりして利点がある。ひとつの container に複数アプリケーションが入っていると、その利点を利用することが不可。

## runserver と yarn dev で起動するところまで

```bash
# NOTE: (2025-03-04) 久しぶりに clone してみたけど、マジで
#       Create containers -> Django のほう
#       をサッサと打つだけで開始できた。イイぞ。

# Create containers
cp ./local.env ./.env; docker compose up -d; docker compose exec webapp-service sh

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
# NOTE: PIPENV_VENV_IN_PROJECT は env で設定してある。
pipenv sync --dev
pipenv run python manage.py migrate
pipenv run python manage.py runserver 0.0.0.0:8000
# --> http://localhost:8001/ でアクセス。

# Nuxt.js のほう。
(cd ./frontend-nuxt; yarn install)
(cd ./frontend-nuxt; yarn dev --hostname 0.0.0.0)
# --> http://localhost:3001/ でアクセス。
```

```bash
# Test commands.
time pipenv run ruff check .
time pipenv run python manage.py test --failfast --parallel --settings=config.settings_test

(cd ./frontend-nuxt; time yarn test .)
(cd ./frontend-nuxt; time yarn lint)
```

## 【Deprecated】 Gemini の更新を派生リポジトリへ取り込む手順

このプロジェクトは取りやめた。たぶんアホな試みだった。

```bash
# 派生リポジトリ側で行う↓

# django-nuxt-gemini を upstream-gemini branch として登録する。
git remote add upstream-gemini git@github.com:yuu-eguci/django-nuxt-gemini.git

# このリポジトリの origin はもちろん自分、 upstream-gemini は Gemini という設定になっていることを確認。
git remote -v
# origin  https://github.com/user/派生リポジトリ.git (fetch)
# origin  https://github.com/user/派生リポジトリ.git (push)
# upstream-gemini git@github.com:yuu-eguci/django-nuxt-gemini.git (fetch)
# upstream-gemini git@github.com:yuu-eguci/django-nuxt-gemini.git (push)
# 間違えちゃったら削除↓
git remote rm upstream-gemini

# Gemini の現状を取得。
git fetch upstream-gemini

# Gemini の main ブランチへ切り替える。
# この状態だと commit 履歴とまったく合ってないので 'detached HEAD' state になる。
git checkout upstream-gemini/main

# 好きなところまで reset で戻る。 (前回のバージョンを指定するのがよさげ)
git reset --mixed HEAD^

# Changes を、そのまま main へコミットしてもいいし、 update-from-upstream ブランチを作ってマージしてもいいし。
# ➕ Update from django-nuxt-gemini upstream
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
