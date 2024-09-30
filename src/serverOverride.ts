const getServerURL = (): string => {
  if (process.env.REACT_APP_KEEPID_BUILD_ENV === 'staging') {
    return 'https://staged.keep.id';
  }
  if (process.env.NODE_ENV === 'production') {
    console.log('https://server.keep.id');
    return 'https://server.keep.id';
  }
  if (process.env.NODE_ENV === 'staging') {
    console.log('https://staged.keep.id');
    return 'https://staged.keep.id';
  }
  return 'http://localhost:7001';
};

export default getServerURL;
