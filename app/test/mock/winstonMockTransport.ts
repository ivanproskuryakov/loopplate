import * as winston from 'winston';
import * as util from 'util';

// save last error to then evaluate it in tests
/* tslint:disable:no-var-keyword */
export var LastMessage: string;
export var LastMeta: any;
/* tslint:enable:no-var-keyword */

/**
 * @see https://github.com/winstonjs/winston#adding-custom-transports
 */
export let MockTransport = function (options) {
  // Name this logger
  this.name = 'Mock';
  // Set the level from your options
  this.level = options.level || 'info';
};

/**
 * Inherit from `winston.Transport` so you can take advantage
 * of the base functionality and `.handleExceptions()`.
 */
util.inherits(MockTransport, winston.Transport);

MockTransport.prototype.log = function (level, msg, meta, callback) {
  // save last error
  LastMessage = msg;
  LastMeta = meta;
  /**
   * Store this message and metadata, maybe use some custom logic
   * then callback indicating success.
   */
  callback(null, true);
};
