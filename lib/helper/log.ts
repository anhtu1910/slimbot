import { transports, createLogger, format } from 'winston'

export class Log {
  static pathPrefix: string = 'logs/'

  static getLog(filename: string) {
    return createLogger({
      format: format.combine(
        format.timestamp(),
        format.printf(({ message, timestamp, level }) => {
          if (typeof message == 'object') {
            message = JSON.stringify(message)
          }

          return `${timestamp} ${level}: ${message}`
        })
      ),
      transports: [
        // new winston.transports.Console(),
        new transports.File({ filename: this.pathPrefix + filename }),
      ],
    })
  }

  static error(content: any) {
    this.getLog('error.log').error(content)
    return this
  }

  static debug(content: any) {
    this.getLog('debug.log').debug(content)
    return this
  }

  static info(content: any) {
    this.getLog('info.log').info(content)
    return this
  }
}
