# 他の image はこちら https://hub.docker.com/_/python
# NOTE: Alpine のバージョンを固定して、下の nodejs-current が Node.js 26 系になるようにしています。
FROM python:3.14-alpine3.24

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

# NOTE: Node.js は Active LTS の 26 系を使います。 (CI の NODE_VERSION とそろえてください。)
#       Alpine 3.24 では nodejs パッケージが 24 系、 nodejs-current パッケージが 26 系です。
#       Yarn は 1 系 (classic) の最終版を使います。
RUN apk add --no-cache --update nodejs-current npm && \
    node --version | grep -q '^v26\.' && \
    npm install --global yarn@1.22.22 && \
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
