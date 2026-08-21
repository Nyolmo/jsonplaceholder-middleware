function asyncHandler(fn){
    return (req,res, next)=> Promise.resolve(fn(req,res,next)).catch(next);
}

function errorHandler(req, res, err, next){
    console.error(`[error] ${req.method} ${req.originalUrl}`, err.message);

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

    return res.status(500).json({
        error:'Internal middleware error'
    });
};

export default {asyncHandler, errorHandler};