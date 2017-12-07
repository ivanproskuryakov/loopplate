import {db} from 'loopback';

/**
 * AccessToken
 *
 * @author Nika Nikabadze
 */
export interface AccessToken {
  id?: string;
  ttl?: number;
  created?: Date;
  userId: string;
}

export interface AccessTokenDataAccessObject extends db.DataAccessObject<AccessToken> {
  findForRequest: (req: any, options: any, cb?: (err: Error, token: AccessToken) => any) => Promise<AccessToken>;
}
