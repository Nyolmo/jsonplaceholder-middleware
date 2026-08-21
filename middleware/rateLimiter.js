import rateLimit from "express-rate-limit";


//rate limiting : 100req/min/IP
export const limiter = rateLimit({
    windowMs: 60 * 1000,
    max:100,
    standardHeaders:true,
    legacyHeaders:false
});