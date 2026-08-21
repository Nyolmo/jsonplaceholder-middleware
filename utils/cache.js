import NodeCache from "node-cache";

const cache = new NodeCache({stdTTL:60, checkperiod:90});

async function getOrFetch(Key, fetchFn, ttlSeconds){
    const cached = cache.get(key);

    if(cached !== undefined){
        return {
            data: cached,
            fromCache: true
        };
    }

    const data = await fetchFn();
    cache.set(key, data, ttlSeconds);

    return {
        data,
        fromCache: false
    };

    function invalidate(key){
        cache.del(key)
    };

    function stats(){
        return cache.getStats();
    }

};

export  {getOrFetch, invalidate, stats};