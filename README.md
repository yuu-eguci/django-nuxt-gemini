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

### ステージング環境用の .env を用意する

```bash
# staging.env がトップディレクトリにあるものとする。
```

### デプロイパッケージを作る

```bash
# Repository から zip をダウンロード。

# トップディレクトリでターミナルを。

# staging.env をチェック。 (staging.env を置くこと)
[ -f ./staging.env ] && echo "Env exists, proceed." || echo "Error: No env."

# Nuxt.js の静的サイトを生成して static フォルダへ配置。
(cd ./webapp/frontend-nuxt; yarn install)
# ステージング環境用の .env を適用してビルド。
# NOTE: .env 内部のコメント行を grep で無視しつつ行う。
(cd ./webapp/frontend-nuxt; env $(grep -v '^#' ../../staging.env | xargs) yarn generate --production)

mkdir ./webapp/static; mv ./webapp/frontend-nuxt/dist/* ./webapp/static/

# デプロイパッケージに不要なものを削除して zip 化。
mkdir ./deploy_package
rsync -av --exclude='.DS_Store' --exclude='webapp/.gitignore' --exclude='webapp/frontend-nuxt/*' docker-compose.yml mysql-container staging.env webapp webapp-container ./deploy_package/
zip -r deploy_package.zip deploy_package/

# デプロイパッケージをサーバへ UL。 (コマンドは別メモに。 IP とか入ってるからさ。)
scp -i ~/.ssh/???.pem deploy_package.zip username@ip:~/
```

### デプロイパッケージを展開する

```bash
# デプロイ先のサーバへ ssh 接続。

# デプロイパッケージを展開。
sudo unzip ~/deploy_package.zip -d ~/

# 環境変数を用意。
sudo mv ~/deploy_package/staging.env ~/deploy_package/.env

# 中身を /webapp へコピー。
# NOTE: ~/deploy_package/* は .env を無視する。 (えぇ〜)
sudo cp -r ~/deploy_package/. /webapp/

# ~/deploy_package.zip と ~/deploy_package/ を削除
sudo rm -rf ~/deploy_package.zip ~/deploy_package/
```

### Docker を起動する

```bash
# Docker 存在確認。
docker --version
# --> Docker version 24.0.6, build ed223bc

# Docker コンテナを起動。
(cd /webapp; sudo docker compose up -d)

# MySQL のユーザを確認。
(cd /webapp; sudo docker compose exec mysql-service sh)
# mysql -u StagingAdmin -p
# --> Enter password: ??? (stage.env に書いてある) --> 入れることを確認
# SHOW DATABASES; --> app があることを確認
# exit

(cd /webapp; sudo docker compose exec webapp-service sh -c "pipenv sync")
(cd /webapp; sudo docker compose exec webapp-service sh -c "pipenv run python manage.py migrate --settings=config.settings_staging")
(cd /webapp; sudo docker compose exec webapp-service sh -c "pipenv run python manage.py collectstatic --noinput --settings=config.settings_staging")
(cd /webapp; sudo docker compose exec webapp-service sh -c "pipenv run gunicorn --bind 0.0.0.0:8000 config.wsgi:application")
# curl http://localhost:8001
```

### Nginx を起動する

```bash
# nginx の設定を追加。
# NOTE: /etc/nginx/nginx.conf の中に 'include /etc/nginx/conf.d/*.conf;' の記載がある。
#       そこで読んでもらうことを意図しています。
#       (あと、デフォルトの設定ファイルの編集を避けるのも意図。)
sudo cp /webapp/staging-nginx.conf /etc/nginx/conf.d/default.conf

sudo nginx -t

# リロード。
sudo systemctl reload nginx
# NOTE: server_name が localhost ではないので curl http://localhost は失敗する。
```

## VSCode を使っているなら settings.json にコレ書いとくとヨシ

"container 内仮想環境にある python modules の中身へ F12 でジャンプできない" 問題をこれで回避できる。

```json
{
    "python.defaultInterpreterPath": "[repository までの絶対パス]/python-packages/virtualenvs/webapp-qv(実際のパス)/bin/python",
    "python.autoComplete.extraPaths": ["[repository までの絶対パス]/python-packages/virtualenvs/webapp-qv(実際のパス)/lib/python3.10/site-packages"],
    "python.analysis.extraPaths": ["[repository までの絶対パス]/python-packages/virtualenvs/webapp-qv(実際のパス)/lib/python3.10/site-packages"],
}
```
