import winston from "winston";

const {combine, timestamp, json, printf, errors} = winston.format; 

const isProduction = process.env.NODE_ENV === 'production';

const developmentFormat = printf(({level, message, timestamp, stack})=>{
    return `${timestamp} ${level}: ${stack || message}`
})


const logger = winston.createLogger({
    level:'info',
    format: combine(
        errors({stack: true}),
        timestamp(),
        isProduction ? json() : developmentFormat
    ),

    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename:'logs/error.log',
            level:'errors'
        })

    ]
});

export default logger;