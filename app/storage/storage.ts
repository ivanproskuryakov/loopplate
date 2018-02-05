let pkgcloud = require('pkgcloud');
let random = require('randomstring');

import {Promise} from 'es6-promise';
import {WriteStream} from 'fs';
import {extname} from 'path';
import {StorageConfigInterface} from 'app/interface/storageConfigInterface';
import {RemoteFile} from 'app/interface/media/remoteFileInterface';

export class Storage {
  /**
   * @constructor
   * @param {StorageConfigInterface} config
   */
  constructor(protected config: StorageConfigInterface) {
  }

  /**
   * @param {Express.Multer.File} file to upload
   * @param {string} filename remote file name
   * @returns {Promise<RemoteFile>}
   */
  public upload(file: Express.Multer.File, filename?: string): Promise<RemoteFile> {

    return new Promise((resolve, reject) => {
      let writeStream: WriteStream = this.createClient().upload({
        container: this.config.container,
        remote: filename || Storage.generateFilename(file.originalname)
      });

      writeStream.on('error', err => {
        reject(err);
      });

      writeStream.on('success', result => {
        resolve(result);
      });

      writeStream.end(file.buffer);
    });
  }

  /**
   * @param {string} filename
   * @returns {Promise}
   */
  public remove(filename: string): Promise<void> {
    if (!filename) {

      return Promise.resolve<void>();
    }

    return new Promise<void>((resolve, reject) => {
      this.createClient().removeFile(this.config.container, filename, err => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }

  /**
   * @param {string[]} files
   * @return {Promise}
   */
  public bulkDelete(files: string[]): Promise<void> {
    return files.reduce((chain, file) =>
        chain.then(() => this.remove(file)),
      Promise.resolve<void>());
  }

  /**
   * create client to communicate with storage service
   * @return {Object}
   */
  private createClient(): any {
    return pkgcloud.storage.createClient(this.config);
  }


  /**
   * @param {string} original file name
   */
  private static generateFilename(original: string): string {
    let extension = extname(original);
    let name = random.generate();

    return name + extension;
  }
}
