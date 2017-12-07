import {Promise} from 'es6-promise';
import * as multer from 'multer';
import {Server} from 'app/server/interface/server';
import {ServerError} from 'app/error/serverError';
import {Storage} from 'app/service/media/storage';
import {MediaValidator} from 'app/service/media/mediaValidator';
import {UserService} from 'app/service/userService';
import {Media, MediaRelation, MediaType} from 'app/models/interface/media';
import {User} from 'app/models/interface/user';

/**
 * manages media for the models
 * @class MediaService
 * @author Nika Nikabadze
 */
export class MediaService {

  /**
   * @private
   */
  private storage: Storage;

  /**
   * @private
   */
  private file: Express.Multer.File;

  /**
   * @private
   */
  private mediaRelation: MediaRelation;

  /**
   * @private
   */
  private user: User;

  /**
   * @constructor
   * @param {Server} app
   */
  constructor(private app: Server) {
    this.storage = new Storage(this.app.get('storage'));
  }

  /**
   * delete user's activity in comments
   * @param {User} user
   * @returns {Promise}
   */
  public deleteUserMedia(user: User): Promise<void> {

    return this.app.models.Media.find({
      where: {userId: user.id},
      fields: ['name']
    }).then(files => {

      return this.storage.bulkDelete(files.map(file => file.name));
    }).then(() => {

      return this.app.models.Media.destroyAll({
        userId: user.id
      });
    });
  }

  /**
   * create new media
   * @param {object} req request
   * @param {object} res response
   * @returns {Promise<Media>}
   */
  public create(req: any, res: any): Promise<Media> {

    return this.initialize(req, res)
      .then(() => this.upload())
      .then(media => this.app.models.Media.create(media));
  }

  /**
   * initialize
   * @param {object} req request
   * @param {object} res response
   * @returns {Promise<void>}
   */
  private initialize(req: any, res: any): Promise<void> {

    return UserService.getUserFromRequest(this.app, req)
      .then(user => this.user = user)
      .then(() => this.extractFile(req, res))
      .then(file => this.file = file)
      .then(() => this.mediaRelation = req.body.relation)
      .then(() => this.validateRequest())
      .then(() => new MediaValidator(this.mediaRelation, this.file).validate());
  }

  /**
   * validation for required fields
   * @returns {Promise<void>}
   */
  private validateRequest(): Promise<void> {
    if (!this.user) {

      return Promise.reject(
        ServerError('User not found', 422)
      );
    }

    if (!this.file) {

      return Promise.reject(
        ServerError('File not found', 422)
      );
    }

    return Promise.resolve<void>();
  }

  /**
   * extracts file using multer
   * @param {object} req request
   * @param {object} res response
   * @returns {Promise<Express.Multer.File>} file
   */
  private extractFile(req: any, res: any): Promise<Express.Multer.File> {
    return new Promise((resolve, reject) => {
      // use memory storage to not save file on disk
      let upload = multer({storage: multer.memoryStorage()}).any();
      upload(req, res, err => {
        if (err) {

          return reject(err);
        }

        resolve(req.files && req.files[0]);
      });
    });
  }

  /**
   * @returns {Promise<Media>}
   */
  private upload(): Promise<Media> {
    const type = this.getMediaType(this.file.mimetype);

    return this.storage
      .upload(this.file)
      .then<Media>(remoteFile => {
        const media: Media = {
          relation: this.mediaRelation,
          userId: this.user.id,
          type: type,
          location: remoteFile.location,
          name: remoteFile.name,
          container: remoteFile.container,
          mimeType: this.file.mimetype,
          size: this.file.size,
          createdAt: new Date()
        };

        return media;
      });
  }

  /**
   * @param {string} mimeType
   * @retuns {MediaType}
   */
  private getMediaType(mimeType: string): MediaType {
    if (MediaValidator.IMAGE_MIME_TYPES.indexOf(mimeType) !== -1) {
      return 'image';
    }

    return null;
  }
}
