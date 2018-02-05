import {Promise} from 'es6-promise';
import {ServerError} from 'app/error/serverError';
import {MediaRelation} from 'app/interface/media/media';

export class MediaValidator {

  public static readonly IMAGE_MIME_TYPES: string[] = [
    'image/png',
    'image/jpeg'
  ];

  /**
   * requirements dictionary for each MediaRelation
   * @type {Object}
   */
  private rules = {
    profilePhoto: {
      size: 500 * 1024, // (500kb)
      mimeTypes: MediaValidator.IMAGE_MIME_TYPES
    },
    profileBackground: {
      size: 1 * 1024 * 1024, // (1mb)
      mimeTypes: MediaValidator.IMAGE_MIME_TYPES
    },
    activity: {
      size: 3 * 1024 * 1024, // (3mb)
      mimeTypes: MediaValidator.IMAGE_MIME_TYPES
    }
  };

  /**
   * @constructor
   * @param {MediaRelation} mediaRelation
   * @param {Express.Multer.File} file
   */
  constructor(private mediaRelation: MediaRelation, private file: Express.Multer.File) {
  }

  /**
   * validates file against mediaType
   * @returns {Promise<void>}
   */
  public validate(): Promise<void> {
    if (!this.validateRelation()) {

      return Promise.reject(
        new ServerError('invalid relation', 422)
      );
    }

    if (!this.validateMimeType()) {

      return Promise.reject(
        new ServerError('invalid mimeType', 422)
      );
    }

    if (!this.validateFileSize()) {

      return Promise.reject(
        new ServerError('file is too large', 422)
      );
    }

    return Promise.resolve<void>();
  }

  /**
   * @returns {boolean}
   */
  private validateFileSize(): boolean {
    return this.file.size <= this.rules[this.mediaRelation].size;
  }

  /**
   * @returns {boolean}
   */
  private validateMimeType(): boolean {
    return this
        .rules[this.mediaRelation]
        .mimeTypes.indexOf(this.file.mimetype) !== -1;
  }

  /**
   * @returns {boolean}
   */
  private validateRelation(): boolean {
    return Object.keys(this.rules).indexOf(this.mediaRelation) !== -1;
  }
}
