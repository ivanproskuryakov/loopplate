import * as winston from 'winston';
let Sentry = require('winston-sentry');
// import {MockTransport} from 'app/test/mock/winstonMockTransport';
import * as App from 'app/server/server';

export type LoggerTransport = 'sentry' | 'mock' | 'file' | 'console';

export class Logger {

  /**
   * @param {LoggerTransport} [transport]
   * @param {Object} [options]
   * @returns {LoggerInstance} logger instance
   */
  public get(transport?: LoggerTransport, options?: any): winston.LoggerInstance {
    let logger = new winston.Logger();

    if (transport && options) {
      logger.add(this.createTransport(transport), options);
    } else {
      const settings = App.get('logs');
      logger.add(this.createTransport(settings.transport), settings.options);
    }

    return logger;
  }

  /**
   * log errors
   * @param {Error} err
   * @param {Object} meta
   */
  public error(err: any, meta?: any): void {
    let logger = this.get();

    logger.error(err, meta);
  }

  /**
   * creates transport for winston based on name
   * @param {LoggerTransport} transport name
   * @returns {winston.TransportStatic}
   */
  private createTransport(transport: LoggerTransport): any {
    switch (transport) {
      case 'sentry':
        return Sentry;
      case 'mock':
        // return MockTransport;
      case 'file':
        return winston.transports.File;
      case 'console':
        return winston.transports.Console;
      default:
        return winston.transports.Console;
    }
  }
}

