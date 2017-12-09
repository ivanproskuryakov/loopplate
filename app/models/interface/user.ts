import {AccessToken} from 'app/models/interface/accessToken';
import {MediaMeta} from 'app/models/interface/mediaMeta';
import {PersistedModel} from 'loopback';

export interface User extends PersistedModel {
  id?: string;
  username?: string;
  password?: string;
  email: string;
  type?: string;
  avatar?: MediaMeta;
  background?: MediaMeta;
  dateOfBirth?: Date;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  country?: string;
  gender?: boolean;
  updatedAt?: Date;
  importedAt?: Date;

  toJSON?: () => User;
  save?: () => Promise<User>;
  accessToken?: AccessToken;
}
