import winston from "winston";

const logger = winston.createLogger({
  ...(process.env.NODE_ENV !== "production" && {
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({ filename: "error.log", level: "error" }),
      new winston.transports.File({ filename: "combined.log" }),
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    ],
  }),
});

if (process.env.NODE_ENV === "production") {
  const noop: winston.LeveledLogMethod = () => logger;
  logger.info = noop;
  logger.error = noop;
  logger.warn = noop;
  logger.debug = noop;
}

export default logger;
