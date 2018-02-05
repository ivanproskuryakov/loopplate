let isbot = require('isbot');
import {MetaRendererService} from 'app/service/metaRenderer';

type Middleware = (req: any, res: any, next: () => void) => void;

/**
 * Middleware to render social crawler's specific html with meta tags
 **/
export = function (app) {

  app.get('/', renderMeta(renderer => renderer.renderIndex()));
  app.get('/u/:userName/a/:activitySlug', renderMeta((renderer, req) => renderer.renderActivity(req.params.activitySlug)));
  app.get('/u/:userName', renderMeta((renderer, req) => renderer.renderUser(req.params.userName)));

  /**
   * @callback metaRendererCallback
   * @param {MetaRendererService} renderer
   * @param {object} req
   * @returns {Promise<string>}
   */

  /**
   * @param {metaRendererCallback} metaRenderer
   * @returns {Middleware}
   */
  function renderMeta(metaRenderer: (renderer: MetaRendererService, req: any) => Promise<string>): Middleware {

    return (req, res, next) => {
      if (!isbot(req.headers['user-agent'])) {
        return next();
      }

      let renderer = new MetaRendererService();
      return metaRenderer(renderer, req)
        .then(html => {

          return res.status(200).send(html);
        })
        .catch(next);
    };
  }

  return renderMeta;
};
