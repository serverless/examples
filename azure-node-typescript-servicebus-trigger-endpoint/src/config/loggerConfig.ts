import * as winston from 'winston';
import * as path from 'path';

const rootLogger = winston.createLogger({
    level: process.env.LOG_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        winston.format.splat(),
        winston.format.printf(
            (info) =>
                `[${info.timestamp}][${info.level.toLocaleUpperCase('en-US')}][${info.source}]: ${
                    info.message
                }`
        )
    ),
    transports: [new winston.transports.Console({ level: process.env.LOG_LEVEL })]
});

const logger = (name: string): winston.Logger => {
    return rootLogger.child({ source: path.relative(process.cwd(), name) });
};

export default logger;
