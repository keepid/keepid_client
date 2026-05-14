# syntax=docker/dockerfile:1.7
#
# Two-stage build:
#   1. node:22 builds the Vite bundle into /app/dist
#   2. nginx:alpine serves dist + reverse-proxies /api/ to the backend
#
# The backend URL is templated into nginx.conf at *container start* (not
# build time) via envsubst, so the same image works against any backend
# without a rebuild. Cloud Run injects $PORT — default 8080.

# ---------- Build stage ----------
FROM node:22.14.0-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund

COPY . .

# Build-time env. Public values (client IDs, captcha keys), so committed
# defaults are fine; override with --build-arg for staging / local.
ARG VITE_GOOGLE_CLIENT_ID=372201349451-q5hss34u3kjpgio4kps5h2sr3fmn54t3.apps.googleusercontent.com
ARG VITE_MICROSOFT_CLIENT_ID=5d26465e-a0e2-494c-a7a1-cbae110b8ae1
ARG VITE_MICROSOFT_TENANT_ID=common
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_MICROSOFT_CLIENT_ID=$VITE_MICROSOFT_CLIENT_ID \
    VITE_MICROSOFT_TENANT_ID=$VITE_MICROSOFT_TENANT_ID \
    VITE_API_BASE=/api

RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:1.27-alpine AS runtime

RUN apk add --no-cache gettext

# Register `.mjs` as a JavaScript MIME type. nginx:1.27-alpine ships
# /etc/nginx/mime.types with `application/javascript js;` but no `mjs`.
# Browsers strict-MIME-check ES module workers (`new Worker(url,
# {type:'module'})`) and `<script type=module>`; without this, pdf.js
# (Vite emits its worker as `*.mjs`) gets served as
# `application/octet-stream`, the browser refuses to execute the module,
# and pdf.js silently falls back to a fake-worker that can't render —
# surfacing as a blank PDF viewer with no console error. This is the
# canonical "works in dev / works on legacy / broken on Cloud Run nginx"
# trap: heroku's `serve` package detects `.mjs` automatically; nginx
# doesn't unless told.
RUN sed -i 's|\(application/javascript[[:space:]]\+\)js;|\1js mjs;|' /etc/nginx/mime.types

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint-keepid.sh
RUN chmod +x /docker-entrypoint-keepid.sh

# Cloud Run sets PORT (default 8080) and BACKEND_URL is read from the
# Cloud Run env. Both are expanded by docker-entrypoint.sh.
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint-keepid.sh"]
