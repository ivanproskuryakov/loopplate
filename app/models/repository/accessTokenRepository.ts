import {AccessToken} from 'app/interface/accessToken';
import * as App from 'app/server/server';

export class AccessTokenRepository {

  /**
   * @param {string} id
   * @returns {Promise<AccessToken>}
   */
  public findById(id: string): Promise<AccessToken> {
    return App.model['accessToken'].findById(id)
  }

  /**
   * @param {AccessToken} accessToken
   * @returns {Promise<AccessToken>}
   */
  public create(accessToken: AccessToken): Promise<AccessToken> {
    return App.model['accessToken'].create(accessToken)
  }

}
