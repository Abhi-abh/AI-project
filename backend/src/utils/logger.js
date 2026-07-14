const winston = require("winston");
const path = require("path");
const fs = require("fs");

const isProduction = process.env.NODE_ENV === "production";

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
);

const transports = [
    new winston.transports.Console({
        format: consoleFormat
    })
];

// Only write log files during local development
if (!isProduction) {
    const logDir = path.join(process.cwd(), "logs");

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    transports.push(
        new winston.transports.File({
            filename: path.join(logDir, "combined.log")
        })
    );

    transports.push(
        new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error"
        })
    );
}

module.exports = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: logFormat,
    transports
});