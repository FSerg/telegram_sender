import appRoot from "app-root-path";
import winston from "winston";

// const options = {
//   file: {
//     level: "info",
//     filename: `${appRoot}/logs/app.log`,
//     handleExceptions: true,
//     json: true,
//     maxsize: 5242880, // 5MB
//     maxFiles: 5,
//     colorize: false
//   },
//   console: {
//     level: "debug",
//     handleExceptions: true,
//     json: false,
//     colorize: true
//   }
// };

// const logger = winston.createLogger({
//   transports: [
//     new winston.transports.File(options.file),
//     new winston.transports.Console(options.console)
//   ],
//   exitOnError: false // do not exit on handled exceptions
// });

const errorFile = {
  level: "error",
  filename: `${appRoot}/logs/error.log`,
  handleExceptions: true,
  maxsize: 5242880, // 5MB
  maxFiles: 5
};

const combinedFile = {
  filename: `${appRoot}/logs/combined.log`,
  maxsize: 5242880, // 5MB
  maxFiles: 15
};

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File(errorFile),
    new winston.transports.File(combinedFile)
  ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
//if (process.env.NODE_ENV !== "production") {
logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.simple(),
      winston.format.timestamp(),
      winston.format.prettyPrint()
    )
  })
);
// }

export default logger;
