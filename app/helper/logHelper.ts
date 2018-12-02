import * as winston from 'winston';
let Sentry = require('winston-sentry');
import * as App from 'app/server/server';

export type LoggerTransport = 'sentry' | 'mock' | 'file' | 'console';

export class Logger {

  /**
   * @param {LoggerTransport} [transport]
   * @param {Object} [options]
   * @returns {Logger} logger instance
   */
  public get(transport?: LoggerTransport, options?: any): winston.Logger {
    const settings = App.get('logs');

    if (transport && options) {
      return winston
        .createLogger(options)
        .add(this.createTransport(transport));
    }

    return winston
      .createLogger(settings.options)
      .add(this.createTransport(settings.transport));
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
   * @returns {winston.transports}
   */
  private createTransport(transport: LoggerTransport): any {
    switch (transport) {
      case 'sentry':
        return Sentry;
      case 'mock':
        return winston.transports.File;
      case 'file':
        return winston.transports.File;
      case 'console':
        return winston.transports.Console;
      default:
        return winston.transports.Console;
    }
  }
}

