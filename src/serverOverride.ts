const getServerURL = () : string => {
  if (typeof process.env.NODE_ENV != "undefined"){
    if(process.env.NODE_ENV.toString().trim() === "production") {
      return 'https://keepid-server-staging.herokuapp.com';
    }
  }
  return 'http://localhost:7000'; 
};

export default getServerURL;
