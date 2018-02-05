import {Request} from 'express';

/**
 * Events related to rest for all model
 */
export class RestEvent {

  /**
   * Override default behaviour for rest create endpoint
   * On successful request
   * set StatusCode to 201
   * set Location header
   * set body to {}
   * @param {Object} ctx
   */
  public static overrideCreateResponse(ctx: any): void {
    if (ctx.res.statusCode && ctx.result.id) {
      // set StatusCode to 201
      ctx.res.statusCode = 201;
      // set Location header
      ctx.res.set('Location', RestEvent.getLocation(ctx.req, ctx.result.id));
      // set body to {}
      ctx.result = {};
    }
  }

  /**
   *
   * @param {Request} req
   * @param {string} resourceId
   * @returns {string}
   */
  private static getLocation(req: Request, resourceId: string): string {
    let baseUrl = req.protocol + '://' + req.get('Host') + req.originalUrl;
    return `${baseUrl}/${resourceId}`;
  }
}
