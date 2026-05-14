#!/bin/sh
set -eu

: "${PORT:=8080}"
: "${BACKEND_URL:?BACKEND_URL must be set (scheme://host of the keepid_server_next Cloud Run service, no trailing slash)}"

# Derive the bare host[:port] from BACKEND_URL for the proxy Host header.
# Strip scheme, then strip any path.
BACKEND_HOST=$(printf '%s' "$BACKEND_URL" | sed -E 's#^[a-zA-Z]+://##; s#/.*$##')

export PORT BACKEND_URL BACKEND_HOST

envsubst '${PORT} ${BACKEND_URL} ${BACKEND_HOST}' \
    < /etc/nginx/templates/default.conf.template \
    > /etc/nginx/conf.d/default.conf

# nginx -g 'daemon off;' keeps it in the foreground so Cloud Run sees it
# as the container's main process.
exec nginx -g 'daemon off;'
