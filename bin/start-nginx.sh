#!/usr/bin/env bash
# 1) make every temp dir Nginx expects
mkdir -p \
  /tmp/client_body_temp \
  /tmp/proxy_temp \
  /tmp/fastcgi_temp \
  /tmp/uwsgi_temp \
  /tmp/scgi_temp

# 2) substitute $PORT into nginx.conf
envsubst '$PORT' < config/nginx.conf > config/nginx.processed.conf

# 3) launch nginx in foreground
exec nginx -g 'daemon off;' -c /app/config/nginx.processed.conf