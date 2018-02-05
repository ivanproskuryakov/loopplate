import {db} from 'loopback-crud';
import {Feed} from 'app/interface/user/feed';
import {AccessToken} from 'app/interface/accessToken';
import {MediaMeta} from 'app/interface/media/mediaMeta';

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
