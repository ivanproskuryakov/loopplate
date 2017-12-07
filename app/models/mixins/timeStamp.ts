let timestamp = require('loopback-ds-timestamp-mixin/time-stamp.js');

/**
 * wrapper mixin for "loopback-ds-timestamp-mixin" module
 * @param {object} Model
 * @param {MixinBootOptions} bootOptions settings for mixin *
 * @typedef {{reatedAt?: string, updatedAt?: string, required?: boolean, validateUpsert?: boolean}} MixinBootOptions
 */
export = timestamp;
