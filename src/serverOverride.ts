const getServerURL = () : string => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://server.keep.id';
  }
  return 'http://localhost:7002';
};

export default getServerURL;
