import {Promise} from 'es6-promise';
import * as faker from 'faker';
import {Storage} from 'app/storage/storage';
import {RemoteFile} from 'app/interface/media/remoteFileInterface';

export class StorageMock extends Storage {

  constructor() {
    super(null);
  }

  /**
   * @override
   */
  public upload(file: Express.Multer.File, filename?: string): Promise<RemoteFile> {
    return Promise.resolve({
      name: file.filename,
      container: 'mock',
      etag: 'mock',
      size: file.size,
      location: faker.image.imageUrl(),
      buffer: new Buffer([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])
    });
  }

  /**
   * @override
   */
  public download(filename: string): Promise<any> {
    return Promise.resolve();
  }

  /**
   * @override
   */
  public remove(filename: string): Promise<any> {
    return Promise.resolve();
  }

  /**
   * @override
   */
  public bulkDelete(files: string[]): Promise<any> {
    return Promise.resolve();
  }
}
