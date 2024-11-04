const getServerURL = (): string => {
  if (process.env.REACT_APP_KEEPID_BUILD_ENV === 'staging') {
    return 'https://staged.keep.id';
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://server.keep.id';
  }
  if (process.env.NODE_ENV === 'staging') {
    return 'https://staged.keep.id';
  }
  return 'http://localhost:7000';
};

export default getServerURL;
