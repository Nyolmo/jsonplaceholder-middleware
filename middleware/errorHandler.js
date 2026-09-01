import logger from '../utils/logger.js';

function asyncHandler(fn){
    return (req,res, next)=> Promise.resolve(fn(req,res,next)).catch(next);
}

function errorHandler( err, req, res, next){
    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl
    });

    if(axios.isAxiosError(err)){
        if(err.response){
            return res.status(err.response.status).json({
                error: 'Upstream API error',
                status: err.response.status
        });
    }

        if(err.code === 'ECONNABORTED'){
            return res.status(504).json({
                error: 'Upstream request timed out...'
            });
        }



    }
    return res.status(500).json({
            error:'Internal middleware error'
        });


};

export {asyncHandler, errorHandler};