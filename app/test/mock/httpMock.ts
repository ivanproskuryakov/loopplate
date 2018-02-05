import * as faker from 'faker';
let httpMocks = require('node-mocks-http');
import * as fileMock from 'app/test/fixtures/file';
import {User} from 'app/interface/user/user';
import {AccessToken} from 'app/interface/accessToken';

export class HttpMock {

  /**
   * creates express's request
   * @param {string} [method='GET']
   * @param {string} [url=faker.internet.url]
   * @param {Object} [params={}]
   * @param {Object} [body={}]
   * @param {Object} [headers={}]
   * @param {string} [originalUrl]
   * @returns {Request}
   */
  public static createRequest(method?: string,
                              url?: string,
                              params?: Object,
                              body?: Object,
                              headers?: {},
                              originalUrl?: string): any {
    return httpMocks.createRequest({
      method: method || 'GET',
      url: url || faker.internet.url(),
      params: params || {},
      body: body || {},
      headers: headers || {
        'user-agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36
        (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36`},
      originalUrl: originalUrl || '',
      connection: {
        remoteAddress: '127.0.0.1'
      }
    });
  }

  /**
   * creates express's request
   * @param {User} [user]
   * @param {AccessToken} [accessToken]
   * @returns {Request}
   */
  public static createRequestByLogin(user?: User,
                                     accessToken?: AccessToken): any {
    let req = HttpMock.createRequest();

    if (user) {
      req.user = user;
    }

    if (accessToken) {
      req.headers.authorization = accessToken.id;
    }

    return req;
  }

  /**
   * creates express's request
   * @param {User} [user]
   * @param {AccessToken} [accessToken]
   * @param {Object} payload
   * @param {Promise<Express.Multer.File>} file
   * @returns {Request}
   */
  public static createRequestByMedia(user?: User,
                                     accessToken?: AccessToken,
                                     payload?: any,
                                     file?: Express.Multer.File): any {
    let req = HttpMock.createRequest(null, null, null, payload);
    req.files = [file || fileMock.get()];

    if (user) {
      req.user = user;
    }

    if (accessToken) {
      req.headers.authorization = accessToken.id;
    }

    return req;
  }

  /**
   * creates express's response
   * @param {Request} [req]
   * @returns {Response}
   */
  public static createResponse(req?: any): any {
    return httpMocks.createResponse({
      eventEmitter: require('events').EventEmitter,
      req: req
    });
  }

}
