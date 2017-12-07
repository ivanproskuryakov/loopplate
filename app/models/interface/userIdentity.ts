import {db} from 'loopback';
/**
 * User
 *
 * @author Nika Nikabadze
 */
export interface UserIdentity {
  id?: any;
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  provider: string;
  authScheme: string;
  externalId: string;
}

export interface UserIdentityDataAccessObject extends db.DataAccessObject<UserIdentity> {

}
