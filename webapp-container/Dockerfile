# 他の image はこちら https://hub.docker.com/_/python
FROM python:3.10-alpine

# 開発環境では .pyc をスキップ。
ENV PYTHONDONTWRITEBYTECODE 1
# 標準出力のバッファリングをスキップ。
ENV PYTHONUNBUFFERED 1

WORKDIR /webapp

# --no-cache --update: 最新のパッケージをディスク容量を節約しながらインストール。
RUN apk add --no-cache --update \
    # For mysqlclient.
    mariadb-dev gcc libc-dev mysql-client && \
    pip install --upgrade pip setuptools && \
    pip install -U pipenv

RUN apk add --no-cache --update nodejs npm && \
    npm install --global yarn && \
    yarn global add create-nuxt-app

RUN apk add --no-cache --update nginx
# NOTE: いやあ、ここで nginx.conf のコピーと nginx 起動を終えたほうが docker の使い方としてはいいんだけど、
#       mount している webapp フォルダの中にあったほうが、コンテナ内で色々試せるのでいいかなって……。
# COPY nginx.conf /etc/nginx/http.d/default.conf
# CMD ["sh", "-c", "nginx -g daemon off"]

# NOTE: まだぼくは "自分で起動すればよくね?" って思ってる派。
# CMD ["sh", "-c", "pipenv sync --dev && pipenv run python manage.py migrate && pipenv run server 0.0.0.0:8000"]

# NOTE: このポートを解放する意図である、というドキュメントとして機能するコマンドです。
#       ポートを実際に解放するコマンドではありません。
EXPOSE 8000
