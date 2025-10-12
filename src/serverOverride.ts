const getServerURL = () => {
  const currentMode = import.meta.env.MODE;

  if (currentMode === 'staging') {
    return 'https://staging.keep.id';
  }
  if (currentMode === 'production') {
    return 'https://server.keep.id';
  }
  if (process.env.NODE_ENV === 'staging') {
    return 'https://staged.keep.id';
  }
  return 'http://localhost:7001';
};

export default getServerURL;
