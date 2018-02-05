import {MediaService} from 'app/models/service/media/mediaService';

export function Attach(Media) {

  /**
   * override Media post route: / - POST
   */
  Media.remoteMethod('post', {
    description: 'create media',
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {type: 'object', root: true, description: 'media'},
    http: {verb: 'post', path: '/', status: 201}
  });

  /**
   * override media post
   * @param {object} req request
   * @param {object} res response
   * @param {function} cb callback
   */
  Media.post = function (req: any, res: any, cb: (err: Error, result?: any) => void) {
    new MediaService()
      .create(req, res)
      .then(media => {
        res.set('Location', media.location);

        cb(null, media);
      })
      .catch(cb);
  };
}
