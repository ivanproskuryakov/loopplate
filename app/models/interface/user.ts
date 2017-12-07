import {db} from 'loopback';
import {AccessToken} from 'app/models/interface/accessToken';
import {MediaMeta} from 'app/models/interface/mediaMeta';
import {Promise} from 'es6-promise';

export interface User {
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
  about?: string;
  facebook?: string;
  youtube?: Feed[];
  instagram?: string;
  twitter?: string;
  website?: string;
  createdAt?: Date;
  updatedAt?: Date;
  importedAt?: Date;

  activitiesCount?: number;

  isFollowing?: boolean;
  followingsCount?: number;
  followersCount?: number;
  followersIds?: string[];
  followers?: db.ReferencesManyRelation<User>;

  rss?: Feed[];


  /**
   * replicate db.DataObject functions
   */
  toJSON?: () => User;
  save?: () => Promise<User>;
  /**
   * relations
   */
  accessToken?: AccessToken;
}

export interface Feed {
  name: string;
  url: string;
  category: string;
}

export interface UserDataAccessObject extends db.DataAccessObject<User> {

}
