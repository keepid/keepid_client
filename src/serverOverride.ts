const getServerURL = () : string => {
    if(process.env.NODE_ENV === 'production'){
        return "https://SOME_ENDPOINT_HERE"
    } else {
        return "https://localhost:7000"
    }
}

export default getServerURL;
