const getServerURL = () : string => {
  console.log("NODE ENV: ", process.env.NODE_ENV)
  console.log("NODE ENV: ", new String(process.env.NODE_ENV).valueOf())
  if(new String(process.env.NODE_ENV).valueOf() === "production") {
    return 'https://keepid-server-staging.herokuapp.com';
  }
  return 'http://localhost:7000'; 
};

export default getServerURL;
