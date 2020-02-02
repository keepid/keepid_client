const getServerURL = () : string => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://SOME_ENDPOINT_HERE';
  }
  return 'http://localhost:7000';
};

export default getServerURL;
