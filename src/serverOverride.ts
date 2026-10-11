const getServerURL = () => {
  const currentMode = import.meta.env.MODE;

  if (currentMode === 'staging') {
    return 'https://staged.keep.id';
  }
  if (currentMode === 'production') {
    return 'https://server.keep.id';
  }
  // Local dev can point at another server checkout, e.g. VITE_API_BASE=http://localhost:7501.
  if (import.meta.env.DEV && import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  return 'http://localhost:7001';
};

export default getServerURL;
