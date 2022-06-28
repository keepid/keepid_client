const getServerURL = () : string => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://server.keep.id';
  }
  return 'http://localhost:7000';
};

export default getServerURL;