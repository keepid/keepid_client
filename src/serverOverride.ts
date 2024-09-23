const getServerURL = (): string => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://server.keep.id';
  }
  if (process.env.NODE_ENV === 'staging') {
    return 'https://staged.keep.id';
  }
  return 'http://localhost:7001';
};

export default getServerURL;
