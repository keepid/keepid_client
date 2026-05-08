// Resolves the server base URL.
//
// Precedence:
//   1. VITE_API_BASE — explicit env var (the new, canonical knob).
//      Set in `.env` / `.env.local` / `.env.staging` etc.
//   2. Per-mode legacy defaults (staged.keep.id, server.keep.id) — kept so
//      existing CI / Heroku builds without VITE_API_BASE keep working.
//   3. Local dev fallback — `http://localhost:7001`, the keepid_server_next
//      dev port.
//
// During the keepid_server_next migration, point local dev at the new
// server with:
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
  return 'http://localhost:7001';
};

export default getServerURL;
