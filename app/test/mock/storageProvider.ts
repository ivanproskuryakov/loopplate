import {EventEmitter} from 'events';
import * as util from 'util';
import * as faker from 'faker';

/**
 * Helper class to mock pkgcloud provider
 * @see https://github.com/Jemsoft/filesystem-storage-pkgcloud
 */
export class MockStorageProvider {

  public upload(options) {
    let StreamMock = () => {
    };
    util.inherits(StreamMock, EventEmitter);

    ['resume', 'pause', 'setEncoding', 'flush', 'write'].forEach(function (method) {
      StreamMock.prototype[method] = function () {
      };
    });

    StreamMock.prototype.end = function () {
      this.emit('success', {
        name: options.remote,
        container: options.container,
        etag: 'mock',
        size: 123,
        location: faker.image.imageUrl() + '/' + options.remote,
        lastModified: new Date()
      });
    };

    return new StreamMock();
  }
}


module.exports.storage = module.exports; // To make it consistent with pkgcloud
module.exports.createClient = function (options) {
  return new MockStorageProvider();
};
