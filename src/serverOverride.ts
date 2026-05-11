// Resolves the server base URL.
//
// Precedence:
//   1. VITE_API_BASE — explicit env var (the canonical knob).
//      Set in `.env` / `.env.local` / `.env.staging` etc.
//   2. Per-mode legacy defaults (staged.keep.id, server.keep.id) — kept so
//      existing CI / Heroku builds without VITE_API_BASE keep working.
//   3. Local dev fallback — `http://localhost:8080`, where the dockerized
//      keepid_server_next listens (per `docker-compose.yml`'s app service).
//
// If you're running the server via `./mvnw spring-boot:run` instead of
// docker (it listens on :7001 in that mode), override with:
//   VITE_API_BASE=http://localhost:7001 npm start
const getServerURL = () => {
  const explicit = import.meta.env.VITE_API_BASE;
  if (explicit && typeof explicit === 'string' && explicit.trim() !== '') {
    return explicit;
  }

  const currentMode = import.meta.env.MODE;
  if (currentMode === 'staging') {
    return 'https://staged.keep.id';
  }
  if (currentMode === 'production') {
    return 'https://server.keep.id';
  }
  return 'http://localhost:8080';
};

export default getServerURL;
