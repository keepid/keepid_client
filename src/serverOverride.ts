const getServerURL = (): string => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://server.keep.id';
  }
  if (process.env.NODE_ENV === 'staging') {
    return 'https://keepid-server-staging.herokuapp.com/';
  }
  return 'https://server.keep.id';
};

export default getServerURL;
