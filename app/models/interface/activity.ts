import {db} from 'loopback';
import {User} from 'app/models/interface/user';
import {Tag} from 'app/models/interface/tag';

/**
 * Activity
 */
export interface Activity {
  id?: any;
  name: string;
  description?: string;
  category?: string;
  source?: string;
  tags?: Tag[];
  slug?: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId: any;
  timelineId?: string;
  achievements?: string[];

  isLiked?: boolean;
  likesCount?: number;
  likedUserIds?: string[];
  likes?: db.ReferencesManyRelation<User>;

  viewsCount?: number;
  views?: [{ ip: string, userId?: string }];

  user?: User;


  toJSON?: () => Activity;
}

export interface ActivityDataAccessObject extends db.DataAccessObject<Activity> {

}
