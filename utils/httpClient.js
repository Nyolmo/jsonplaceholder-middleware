import axios from "axios";
import axiosRetry from "axios-retry";

const UPSTREAM_URL = process.env.UPSTREAM_URL || 'https://jsonplaceholder.typicode.com/';

const httpClient = axios.create({
    baseURL: UPSTREAM_URL,
    timeout: 5000 // if the site is slow, shouldn't hang our whole app...

});

axiosRetry(httpClient,{
    retries:3,
    retryDelay:axiosRetry.exponentialDelay,
    retryCondition: (error)=> {
        return(
            axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED'
        );
    },
});

export default httpClient;