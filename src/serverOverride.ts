const getServerURL = (): string => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://server.keep.id';
  }
  if (process.env.NODE_ENV === 'staging') {
    return 'https://keepid-server-staging.herokuapp.com/';
  }
  return 'http://localhost:7001';
};

export default getServerURL;

// const getServerURL = (): string => {
//   if (process.env.NODE_ENV === 'production') {
//     return 'https://server.keep.id';
//   }
//   if (process.env.NODE_ENV === 'staging') {
//     return 'https://server.keep.id';
//   }
//   return 'https://server.keep.id';
// };

// export default getServerURL;
