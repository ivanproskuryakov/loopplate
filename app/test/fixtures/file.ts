import * as _ from 'lodash';
import * as Express from 'multer';

export function get(mimeType?: string, size?: number): Express.Multer.File {
  mimeType = mimeType || 'image/jpeg';
  size = size || 1;

  return {
    /** Field name specified in the form */
    fieldname: 'file',
    /** Name of the file on the user's computer */
    originalname: 'somefile.dat',
    /** Encoding type of the file */
    encoding: '',
    /** Mime type of the file */
    mimetype: mimeType,
    /** Size of the file in bytes */
    size: size,
    /** The folder to which the file has been saved (DiskStorage) */
    destination: '',
    /** The name of the file within the destination (DiskStorage) */
    filename: 'somefile.dat',
    /** Location of the uploaded file (DiskStorage) */
    path: '',
    /** A Buffer of the entire file (MemoryStorage) */
    buffer: new Buffer(_.range(0, size).map(() => 0x62))
  };
}
