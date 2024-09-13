import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export const logInfo = (message: string) => {
  logger.log({
    level: 'info',
    message: message,
  });
};

export const logError = (message: string) => {
  logger.log({
    level: 'error',
    message: message,
  });
};
