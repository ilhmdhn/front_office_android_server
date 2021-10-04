var winston = require('winston');
winston.emitErrs = true;

/**
 * Use CallSite to extract filename and number
 * @returns {string} filename and line number separated by a colon
 */
const getFileNameAndLineNumber = () => {
    const oldStackTrace = Error.prepareStackTrace;
    try {
        // eslint-disable-next-line handle-callback-err
        Error.prepareStackTrace = (err, structuredStackTrace) => structuredStackTrace;
        Error.captureStackTrace(this);
        // in this example I needed to "peel" the first 10 CallSites in order to get to the caller we're looking for, hence the magic number 11
        // in your code, the number of stacks depends on the levels of abstractions you're using, which mainly depends on winston version!
        // so I advise you to put a breakpoint here and see if you need to adjust the number!
        return this.stack[11].getFileName() + ':' + this.stack[11].getLineNumber();
    } finally {
        Error.prepareStackTrace = oldStackTrace;
    }
};

function humanReadableFormatter({ level, message }) {
    const filename = getFileNameAndLineNumber();
    return `[${level}] ${filename} ${message}`;
}

/* new winston.transports.Console({
    level: 'info',
    handleExceptions: true,
    humanReadableUnhandledException: true,
    json: false,
    colorize: 'level',
    stderrLevels: ['warn', 'error', 'alert'],
    formatter: humanReadableFormatter,
}) */
var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: './logs.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};